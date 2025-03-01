#include <WiFi.h>
#include <Wire.h>
#include "MAX30100_PulseOximeter.h"
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <PubSubClient.h>
#include <WiFiClientSecure.h>

#define BUTTON_PIN 12
#define BUZZER_PIN 13

#define ENABLE_MAX30100 1
#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1

Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

#if ENABLE_MAX30100
#define REPORTING_PERIOD_MS 1000
PulseOximeter pox;
#endif

uint32_t tsLastReport = 0;
bool fingerDetected = false;
int countdown = 30;
bool countdownStarted = false;
bool showResultPhase = false;
unsigned long resultStartTime = 0;

int highestBPM = 0, highestSpO2 = 0;
String bpmStatus = "Normal Heart Rate";
String spo2Status = "Normal Oxygen Level";

// 🛜 WiFi Credentials
const char* wifi_ssid = "pkr";
const char* wifi_password = "Test@1234";

// 🔗 MQTT Broker Details
const char* mqtt_server = "9f691d9046244be4883c438940c58759.s1.eu.hivemq.cloud";
const int mqtt_port = 8883;
const char* mqtt_username = "qwerty";
const char* mqtt_password = "Test@1234";
const char* mqtt_topic = "demo";

WiFiClientSecure espClient;
PubSubClient client(espClient);
WiFiServer server(80);

// Function to connect to WiFi
void connectWiFi() {
  WiFi.begin(wifi_ssid, wifi_password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }

  Serial.println("\nWiFi Connected!");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

// Callback function to receive MQTT messages
void mqttCallback(char* topic, byte* payload, unsigned int length) {
  Serial.print("MQTT Message Received on Topic: ");
  Serial.println(topic);
  
  String message = "";
  for (int i = 0; i < length; i++) {
    message += (char)payload[i];
  }
  
  Serial.println("Message: " + message);
  
  if (message == "start") {
    Serial.println("Received 'start' command. Starting measurement...");
    startMeasurement();
  }
}

// Function to connect to MQTT
void setupMQTT() {
  espClient.setInsecure();  // Disable SSL certificate validation
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(mqttCallback);

  while (!client.connected()) {
    Serial.print("Connecting to MQTT...");
    if (client.connect("ESP32_Client", mqtt_username, mqtt_password)) {
      Serial.println("Connected to MQTT Broker!");
      client.subscribe(mqtt_topic);  // Subscribe to the topic
    } else {
      Serial.print("Failed, rc=");
      Serial.print(client.state());
      Serial.println(" Retrying in 5 seconds...");
      delay(5000);
    }
  }
}

// Function to publish data to MQTT
void publishMQTT() {
  if (client.connected()) {
    String jsonPayload = "{";
    jsonPayload += "\"bpm\": " + String(highestBPM) + ",";
    jsonPayload += "\"bpm_status\": \"" + bpmStatus + "\",";
    jsonPayload += "\"spo2\": " + String(highestSpO2) + ",";
    jsonPayload += "\"spo2_status\": \"" + spo2Status + "\"";
    jsonPayload += "}";

    Serial.println("Publishing MQTT: " + jsonPayload);
    client.publish(mqtt_topic, jsonPayload.c_str());
  }
}

// Function to start measurement
void startMeasurement() {
  countdown = 30;  
  highestBPM = 0;
  highestSpO2 = 0;
  countdownStarted = true;
  showResultPhase = false;
  tone(BUZZER_PIN, 1000, 500);

  display.clearDisplay();
  display.setTextSize(2);
  display.setCursor(10, 20);
  display.print("Measuring...");
  display.display();
}

// Function to update OLED display
void updateOLED() {
  display.clearDisplay();
  display.setTextSize(1);
  display.setCursor(5, 5);
  display.print("BPM: ");
  display.print(highestBPM);
  
  display.setCursor(5, 20);
  display.print("SpO2: ");
  display.print(highestSpO2);
  display.print("%");

  display.setCursor(5, 35);
  if (showResultPhase) {
    display.print(bpmStatus);
    display.setCursor(5, 50);
    display.print(spo2Status);
  }

  display.display();
}

void onBeatDetected() {
  Serial.println("Beat detected!");
  fingerDetected = true;
}

void setup() {
  Serial.begin(115200);
  connectWiFi();
  setupMQTT();
  server.begin();

  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println(F("SSD1306 allocation failed"));
    for (;;);
  }

  display.clearDisplay();
  display.setTextSize(2);
  display.setTextColor(SSD1306_WHITE);
  display.setCursor(10, 10);
  display.println("Sickle Detector");
  display.display();
  delay(2000);

#if ENABLE_MAX30100
  if (!pox.begin()) {
    Serial.println("MAX30100 initialization FAILED!");
    while (true);
  }
  pox.setIRLedCurrent(MAX30100_LED_CURR_7_6MA);
  pox.setOnBeatDetectedCallback(onBeatDetected);
#endif

  pinMode(BUTTON_PIN, INPUT_PULLUP);
  pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
  if (!client.connected()) {
    setupMQTT();
  }
  client.loop();

  if (digitalRead(BUTTON_PIN) == LOW && !countdownStarted) {
    startMeasurement();
  }

  if (countdownStarted) {
    static unsigned long lastTime = millis();
    if (millis() - lastTime >= 1000) {
      lastTime = millis();
      if (countdown > 0) {
        if (fingerDetected) {
          int currentBPM = pox.getHeartRate();
          int currentSpO2 = pox.getSpO2();

          if (currentBPM > highestBPM) highestBPM = currentBPM;
          if (currentSpO2 > highestSpO2) highestSpO2 = currentSpO2;
        }
        countdown--;
        updateOLED();
      } else {
        countdownStarted = false;
        showResultPhase = true;
        resultStartTime = millis();

        if (highestBPM > 110) bpmStatus = "Tachycardia: Stress, Fever, Dehydration";
        else if (highestBPM < 60) bpmStatus = "Bradycardia: Low Heart Rate";
        else bpmStatus = "Normal Heart Rate";

        if (highestSpO2 < 85) spo2Status = "⚠️ Be Alert!!! You are Not Safe Now";
        else spo2Status = "Normal Oxygen Level";

        updateOLED();
        publishMQTT();
      }
    }
  }

  if (showResultPhase && millis() - resultStartTime >= 3000) {
    showResultPhase = false;
    updateOLED();
  }

  pox.update();
}
