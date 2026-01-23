import 'package:flutter/material.dart';
import 'auth/login.dart';

void main() {
  runApp(KingsbalApp());
}

class KingsbalApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Kingsbal Digital Healthcare Bridge',
      theme: ThemeData(primarySwatch: Colors.blue),
      home: LoginScreen(),
    );
  }
}
