import 'package:http/http.dart' as http;
import 'package:sqflite/sqflite.dart';
import 'dart:convert';
import '../database/local_db.dart';
import '../auth/auth_service.dart';
import '../config/api.dart';

class SyncService {
  static Future<void> syncQuestions(int topicId) async {
    final token = await AuthService.getToken();
    final res = await http.get(
      Uri.parse("$BASE_URL/questions/$topicId"),
      headers: {"Authorization": "Bearer $token"},
    );

    if (res.statusCode == 200) {
      final db = await LocalDB.db;
      final data = jsonDecode(res.body);

      for (var q in data) {
        await db.insert("questions", {
          "id": q["id"],
          "question": q["question"],
          "options": jsonEncode(q["options"]),
          "explanation": q["explanation"]
        }, conflictAlgorithm: ConflictAlgorithm.replace);
      }
    }
  }

  static Future<void> syncOfflineBundle({List<String> courseCodes = const []}) async {
    final token = await AuthService.getToken();
    final query = courseCodes.isEmpty ? "" : "?courseCodes=${courseCodes.join(',')}";
    final res = await http.get(
      Uri.parse("$BASE_URL/curriculum/ai/offline-bundle$query"),
      headers: {"Authorization": "Bearer $token"},
    );

    if (res.statusCode == 200) {
      final db = await LocalDB.db;
      final data = jsonDecode(res.body);
      final syncedAt = DateTime.now().toIso8601String();

      for (var course in data["courses"] ?? []) {
        await db.insert("courses", {
          "code": course["code"],
          "title": course["title"],
          "semester": course["semester"],
          "content": jsonEncode(course),
          "synced_at": syncedAt
        }, conflictAlgorithm: ConflictAlgorithm.replace);
      }

      for (var pack in data["study_packs"] ?? []) {
        await db.insert("study_packs", {
          "course_code": pack["courseCode"],
          "title": pack["title"],
          "content": jsonEncode(pack["content"]),
          "synced_at": syncedAt
        }, conflictAlgorithm: ConflictAlgorithm.replace);
      }

      for (var item in data["tutor_messages"] ?? []) {
        await db.insert("tutor_messages", {
          "course_code": item["course_code"],
          "topic": item["topic"],
          "question": item["question"],
          "response": jsonEncode(item["response"]),
          "ai_generated": item["response"] is Map && item["response"]["aiGenerated"] == true ? 1 : 0,
          "synced_at": syncedAt,
          "created_at": item["created_at"] ?? syncedAt
        });
      }

      if (data["study_plan"] != null && data["study_plan"]["plan"] != null) {
        await db.insert("study_plan_snapshots", {
          "plan_date": DateTime.now().toIso8601String().substring(0, 10),
          "plan": jsonEncode(data["study_plan"]["plan"]),
          "synced_at": syncedAt
        }, conflictAlgorithm: ConflictAlgorithm.replace);
      }
    }
  }

  static Future<void> saveLocalProgress({
    required String courseCode,
    bool lessonCompleted = false,
    bool flashcardsCompleted = false,
    int quizScore = 0,
    int quizTotal = 0,
    int streakCount = 0,
  }) async {
    final db = await LocalDB.db;
    final xp = (lessonCompleted ? 20 : 0) + (flashcardsCompleted ? 10 : 0) + (quizScore * 10);
    await db.insert("learning_progress", {
      "course_code": courseCode,
      "lesson_completed": lessonCompleted ? 1 : 0,
      "flashcards_completed": flashcardsCompleted ? 1 : 0,
      "quiz_score": quizScore,
      "quiz_total": quizTotal,
      "xp": xp,
      "streak_count": streakCount,
      "synced": 0,
      "updated_at": DateTime.now().toIso8601String()
    }, conflictAlgorithm: ConflictAlgorithm.replace);
  }

  static Future<void> saveLocalLogbook({
    required String procedureName,
    String? category,
    String? performedAt,
    String? patientCondition,
    String? reflection,
    String? supervisorName,
    String? supervisorSignature,
  }) async {
    final db = await LocalDB.db;
    await db.insert("clinical_logbook_entries", {
      "procedure_name": procedureName,
      "category": category,
      "performed_at": performedAt,
      "patient_condition": patientCondition,
      "reflection": reflection,
      "supervisor_name": supervisorName,
      "supervisor_signature": supervisorSignature,
      "status": "submitted",
      "synced": 0,
      "created_at": DateTime.now().toIso8601String()
    });
  }

  static Future<void> syncProgress() async {
    final token = await AuthService.getToken();
    final db = await LocalDB.db;
    final progress = await db.query("learning_progress", where: "synced = ?", whereArgs: [0]);
    final logbook = await db.query("clinical_logbook_entries", where: "synced = ?", whereArgs: [0]);

    if (progress.isEmpty && logbook.isEmpty) return;

    final res = await http.post(
      Uri.parse("$BASE_URL/users/progress/sync"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
      body: jsonEncode({
        "progress": progress.map((row) => {
          "course_code": row["course_code"],
          "lesson_completed": row["lesson_completed"] == 1,
          "flashcards_completed": row["flashcards_completed"] == 1,
          "quiz_score": row["quiz_score"],
          "quiz_total": row["quiz_total"],
          "xp": row["xp"],
          "streak_count": row["streak_count"]
        }).toList(),
        "logbook": logbook.map((row) => {
          "procedure_name": row["procedure_name"],
          "category": row["category"],
          "performed_at": row["performed_at"],
          "patient_condition": row["patient_condition"],
          "reflection": row["reflection"],
          "supervisor_name": row["supervisor_name"],
          "supervisor_signature": row["supervisor_signature"],
          "status": row["status"]
        }).toList()
      }),
    );

    if (res.statusCode == 200) {
      await db.update("learning_progress", {"synced": 1}, where: "synced = ?", whereArgs: [0]);
      await db.update("clinical_logbook_entries", {"synced": 1}, where: "synced = ?", whereArgs: [0]);
    }
  }

  static Future<Map<String, dynamic>?> askTutor({
    required String question,
    String? courseCode,
    String topic = "General Nursing",
    String learningLevel = "simple",
  }) async {
    final token = await AuthService.getToken();
    final res = await http.post(
      Uri.parse("$BASE_URL/questions/tutor/ask"),
      headers: {
        "Authorization": "Bearer $token",
        "Content-Type": "application/json"
      },
      body: jsonEncode({
        "question_text": question,
        "courseCode": courseCode,
        "topic": topic,
        "learningLevel": learningLevel
      }),
    );

    if (res.statusCode != 200) return null;

    final data = jsonDecode(res.body);
    final explanation = data["explanation"];
    if (explanation == null) return null;

    final db = await LocalDB.db;
    await db.insert("tutor_messages", {
      "course_code": explanation["courseCode"] ?? courseCode,
      "topic": explanation["topic"] ?? topic,
      "question": question,
      "response": jsonEncode(explanation),
      "ai_generated": explanation["aiGenerated"] == true ? 1 : 0,
      "synced_at": DateTime.now().toIso8601String(),
      "created_at": DateTime.now().toIso8601String()
    });

    return Map<String, dynamic>.from(explanation);
  }

  static Future<List<Map<String, dynamic>>> getCachedTutorMessages({String? courseCode}) async {
    final db = await LocalDB.db;
    final rows = await db.query(
      "tutor_messages",
      where: courseCode == null ? null : "course_code = ?",
      whereArgs: courseCode == null ? null : [courseCode],
      orderBy: "created_at DESC",
      limit: 30,
    );
    return rows.map((row) => Map<String, dynamic>.from(row)).toList();
  }

  static Future<Map<String, dynamic>?> syncStudyPlan() async {
    final token = await AuthService.getToken();
    final res = await http.get(
      Uri.parse("$BASE_URL/users/study-plan"),
      headers: {"Authorization": "Bearer $token"},
    );

    if (res.statusCode != 200) return null;

    final data = jsonDecode(res.body);
    final plan = data["plan"];
    if (plan == null) return null;

    final db = await LocalDB.db;
    await db.insert("study_plan_snapshots", {
      "plan_date": DateTime.now().toIso8601String().substring(0, 10),
      "plan": jsonEncode(plan),
      "synced_at": DateTime.now().toIso8601String()
    }, conflictAlgorithm: ConflictAlgorithm.replace);

    return Map<String, dynamic>.from(plan);
  }

  static Future<Map<String, dynamic>?> getCachedStudyPlan() async {
    final db = await LocalDB.db;
    final rows = await db.query(
      "study_plan_snapshots",
      orderBy: "plan_date DESC",
      limit: 1,
    );

    if (rows.isEmpty || rows.first["plan"] == null) return null;
    return Map<String, dynamic>.from(jsonDecode(rows.first["plan"] as String));
  }
}
