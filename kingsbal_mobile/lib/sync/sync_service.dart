import 'package:http/http.dart' as http;
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
}
