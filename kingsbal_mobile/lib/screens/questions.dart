import 'package:flutter/material.dart';
import '../database/local_db.dart';
import 'dart:convert';

class QuestionsScreen extends StatefulWidget {
  @override
  _QuestionsScreenState createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  List questions = [];

  @override
  void initState() {
    super.initState();
    loadOffline();
  }

  void loadOffline() async {
    final db = await LocalDB.db;
    final data = await db.query("questions");
    setState(() => questions = data);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Offline Questions")),
      body: ListView.builder(
        itemCount: questions.length,
        itemBuilder: (_, i) {
          final q = questions[i];
          final options = jsonDecode(q["options"] ?? "{}");

          return Card(
            child: Padding(
              padding: EdgeInsets.all(10),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(q["question"]),
                  ...options.entries.map<Widget>((e) =>
                      Text("${e.key}. ${e.value}")),
                  Text("Explanation: ${q["explanation"]}",
                      style: TextStyle(color: Colors.green))
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
