import 'package:http/http.dart' as http;
import 'dart:convert';
import 'dart:math';
import 'package:shared_preferences/shared_preferences.dart';
import '../config/api.dart';

class AuthService {
  static Future<bool> login(String email, String password) async {
    final deviceId = await getDeviceId();
    final res = await http.post(
      Uri.parse("$BASE_URL/auth/login"),
      headers: {"Content-Type": "application/json"},
      body: jsonEncode({
        "username_or_email": email,
        "password": password,
        "device_id": deviceId,
        "device_name": "mobile_app"
      }),
    );

    if (res.statusCode == 200) {
      final data = jsonDecode(res.body);
      SharedPreferences prefs = await SharedPreferences.getInstance();
      await prefs.setString("token", data["token"]);
      return true;
    }
    return false;
  }

  static Future<String?> getToken() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    return prefs.getString("token");
  }

  static Future<String> getDeviceId() async {
    SharedPreferences prefs = await SharedPreferences.getInstance();
    final existing = prefs.getString("device_id");
    if (existing != null && existing.isNotEmpty) return existing;

    final random = Random.secure();
    final bytes = List<int>.generate(16, (_) => random.nextInt(256));
    final id = bytes.map((b) => b.toRadixString(16).padLeft(2, "0")).join();
    await prefs.setString("device_id", id);
    return id;
  }
}
