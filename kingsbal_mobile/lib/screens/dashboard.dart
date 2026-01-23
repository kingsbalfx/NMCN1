import 'package:flutter/material.dart';
import 'subjects.dart';

class Dashboard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text("Kingsbal Dashboard")),
      body: Center(
        child: ElevatedButton(
          child: Text("Start Learning"),
          onPressed: () {
            Navigator.push(
                context, MaterialPageRoute(builder: (_) => Subjects()));
          },
        ),
      ),
    );
  }
}
