import 'package:flutter/material.dart';
import '../sync/sync_service.dart';
import 'questions.dart';

class Subjects extends StatelessWidget {
  final List<Map<String, dynamic>> subjects = const [
    {"id": 1, "title": "Anatomy & Physiology"},
    {"id": 2, "title": "Foundation of Nursing"},
    {"id": 3, "title": "Medical-Surgical Nursing"},
    {"id": 4, "title": "Primary Health Care"},
    {"id": 5, "title": "Pharmacology"},
    {"id": 6, "title": "Reproductive Health"},
    {"id": 7, "title": "Community Health Nursing"},
    {"id": 8, "title": "Mental Health Nursing"},
    {"id": 9, "title": "Emergency & Disaster Nursing"},
    {"id": 10, "title": "Quality & Patient Safety"},
  ];

  Future<void> _openSubject(BuildContext context, int topicId) async {
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text("Syncing topic for offline study...")),
    );

    await SyncService.syncOfflineBundle();
    await SyncService.syncQuestions(topicId);

    if (!context.mounted) return;
    Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => QuestionsScreen()),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Curriculum Quests")),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: subjects.length,
        itemBuilder: (_, index) {
          final subject = subjects[index];
          return Card(
            child: ListTile(
              title: Text(subject["title"]),
              subtitle: const Text("Download lessons and practice offline"),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => _openSubject(context, subject["id"]),
            ),
          );
        },
      ),
    );
  }
}
