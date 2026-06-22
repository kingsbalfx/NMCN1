import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class LocalDB {
  static Database? _db;

  static Future<Database> get db async {
    if (_db != null) return _db!;
    _db = await init();
    return _db!;
  }

  static Future<Database> init() async {
    final path = join(await getDatabasesPath(), "kingsbal.db");
    return openDatabase(
      path,
      version: 5,
      onCreate: (db, _) async {
        await db.execute('''
          CREATE TABLE questions(
            id INTEGER PRIMARY KEY,
            question TEXT,
            options TEXT,
            explanation TEXT
          )
        ''');
        await _createPhaseThreeTables(db);
        await _createPhaseFourTables(db);
        await _createPhaseFiveTables(db);
        await _createPhaseSixTables(db);
      },
      onUpgrade: (db, oldVersion, newVersion) async {
        if (oldVersion < 2) {
          await _createPhaseThreeTables(db);
        }
        if (oldVersion < 3) {
          await _createPhaseFourTables(db);
        }
        if (oldVersion < 4) {
          await _createPhaseFiveTables(db);
        }
        if (oldVersion < 5) {
          await _createPhaseSixTables(db);
        }
      },
    );
  }

  static Future<void> _createPhaseThreeTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS courses(
        code TEXT PRIMARY KEY,
        title TEXT,
        semester TEXT,
        content TEXT,
        synced_at TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS study_packs(
        course_code TEXT PRIMARY KEY,
        title TEXT,
        content TEXT,
        synced_at TEXT
      )
    ''');
  }

  static Future<void> _createPhaseFourTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS learning_progress(
        course_code TEXT PRIMARY KEY,
        lesson_completed INTEGER DEFAULT 0,
        flashcards_completed INTEGER DEFAULT 0,
        quiz_score INTEGER DEFAULT 0,
        quiz_total INTEGER DEFAULT 0,
        xp INTEGER DEFAULT 0,
        streak_count INTEGER DEFAULT 0,
        synced INTEGER DEFAULT 0,
        updated_at TEXT
      )
    ''');

    await db.execute('''
      CREATE TABLE IF NOT EXISTS clinical_logbook_entries(
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        procedure_name TEXT,
        category TEXT,
        performed_at TEXT,
        patient_condition TEXT,
        reflection TEXT,
        supervisor_name TEXT,
        supervisor_signature TEXT,
        status TEXT,
        synced INTEGER DEFAULT 0,
        created_at TEXT
      )
    ''');
  }

  static Future<void> _createPhaseFiveTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS tutor_messages(
        local_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_code TEXT,
        topic TEXT,
        question TEXT,
        response TEXT,
        ai_generated INTEGER DEFAULT 0,
        synced_at TEXT,
        created_at TEXT
      )
    ''');
  }

  static Future<void> _createPhaseSixTables(Database db) async {
    await db.execute('''
      CREATE TABLE IF NOT EXISTS study_plan_snapshots(
        plan_date TEXT PRIMARY KEY,
        plan TEXT,
        synced_at TEXT
      )
    ''');
  }
}
