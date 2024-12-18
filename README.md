# LLM4Code

## 📝 תיאור
מערכת צ'אט לניתוח והסבר קוד המבוססת על מודלים מקומיים של Ollama. המערכת מאפשרת שיחה עם מודלי שפה שונים לצורך הבנת קוד, דיבוג ופתרון בעיות תכנות.

## 🎯 מטרת הפרויקט
המערכת נועדה לספק ממשק נוח להתייעצות עם מודלי שפה מתקדמים בנושאי תכנות, כאשר כל העיבוד מתבצע מקומית על המחשב שלך - ללא תלות בשירותי ענן או API חיצוניים.

## 💻 דרישות מערכת
* Python 3.8 ומעלה
* 8GB RAM לפחות (תלוי במודל שנבחר)
* מערכת הפעלה: Windows/Mac/Linux

## 🚀 התקנה

### התקנת Ollama

1. הורד את Ollama מהאתר הרשמי:
   * [הורד Ollama](https://ollama.ai/download)
   * עקוב אחר הוראות ההתקנה למערכת ההפעלה שלך

2. הורד את המודלים הרצויים:
   ```bash
   # מודל מהיר (~4GB)
   ollama pull mistral    

   # מודל מיוחד לקוד (~8GB)
   ollama pull codellama  

   # מודל כללי (~8GB)
   ollama pull llama2     
   ```

### התקנת הפרויקט

1. שכפל את הריפוזיטורי:
   ```bash
   git clone https://github.com/yarivtch/llm4Code.git
   cd llm4Code
   ```

2. התקן את התלויות הנדרשות:
   ```bash
   pip install -r requirements.txt
   ```

## ⚡ הפעלה

1. הפעל את שרת Ollama (בטרמינל נפרד):
   ```bash
   ollama serve
   ```

2. הפעל את שרת Flask (בטרמינל נפרד):
   ```bash
   python server.py
   ```

3. הפעל שרת מקומי לממשק המשתמש (בטרמינל נפרד):
   ```bash
   python -m http.server 8080
   ```

4. פתח את הדפדפן בכתובת:
   ```
   http://localhost:8080
   ```

## 🎮 שימוש במערכת
1. בחר את המודל הרצוי מהרשימה הנפתחת
2. התאם את הטמפרטורה לפי הצורך:
   * ערכים גבוהים = יותר יצירתיות
   * ערכים נמוכים = יותר דיוק
3. הכנס את הקוד או השאלה שלך
4. לחץ על "שלח" או השתמש ב-Ctrl+Enter

## ✨ תכונות
* תמיכה במגוון מודלים מקומיים
* עיבוד מהיר עם streaming
* הצגת קוד מעוצבת
* אפשרות להעתקת קוד בלחיצה
* שמירת היסטוריית שיחה
* ממשק משתמש נוח בעברית

## ❗ פתרון בעיות נפוצות
* **המודל לא מגיב?** וודא ששרת Ollama רץ
* **הממשק לא נטען?** וודא ששרת HTTP רץ
* **מודל לא עובד?** נסה להוריד אותו מחדש עם `ollama pull`
* **בעיות זיכרון?** נסה מודל קטן יותר או הגדל את ה-swap

## 🔄 פיתוח עתידי
* [ ] תמיכה ביותר מודלים
* [ ] אפשרויות קונפיגורציה נוספות
* [ ] שיפור מהירות התגובה
* [ ] הוספת תמיכה בסינטקס הייטלייטינג

## 📄 רישיון
----