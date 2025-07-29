import netscape.javascript.JSObject;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.*;
import java.sql.Timestamp;


// Класс ядра платформы
public class CorePlatform {

    private Random rnd = new Random();                                                          // Рандомайзер
//    private ArrayList<String> coreMethodsNames = new ArrayList<>();                             // Список методов доступных для вызова запросом от клиента
    private HashMap<String, Method> coreMethodsNames = new HashMap<>();                         // Список методов доступных для вызова запросом от клиента
    private HashMap<String, HashMap<String, Object>> userSessions = new HashMap<>();            // Список сесий пользователей
    private Integer usessUUIDLen = 12;                                                          // Длина идентификатора сессии пользователя в символах
    private String UUIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";                          // Набор символов для генерации UUID'ов

    public CorePlatform(){
        Method[] methods = this.getClass().getMethods();

        for (Method method : methods){
            if (method.getName().substring(0,4).equals("req_")) {
//                coreMethodsNames.add(method.getName());
                coreMethodsNames.put(method.getName().toLowerCase(), method);
                System.out.println("Method "+method.getName()+" listed from core");
            }
        }
    }

    // Запрос формы входа/аутентификации
    public String req_getEntranceForm(JSONObject request){

        return "{}";
    }

    // Обработка запроса регистрации нового клиента
    public String req_registration(JSONObject request){

        String usessid = addNewUserSession();

        JSONObject jResp = new JSONObject();
        jResp.put("error", false);
        jResp.put("action", "registration");
        jResp.put("usessid", usessid);
        return jResp.toString();
    }

    // Проверка существования и доступности метода ядра для вызова по запросу клиента
    public boolean req_exists(String name){
        if (coreMethodsNames.containsKey(name.toLowerCase())) {
            return true;
        }
//        if (coreMethodsNames.contains(name)) {
//            return true;
//        }
        return false;
    }

    // Получение ссылки на метод ядра
    public Method get_req_method(String name){
        if (coreMethodsNames.containsKey(name.toLowerCase())) {
            return coreMethodsNames.get(name.toLowerCase());
        }

        return null;
    }

    // Генерация нового уникального ID пользовательской сессии
    private String newUserSessionId(){
        String newUUID = generateUUID(rnd, UUIDChars, usessUUIDLen);

        while (userSessions.containsKey(newUUID)){
            newUUID = generateUUID(rnd, UUIDChars, usessUUIDLen);
        }

        return newUUID;
    }

    // Создание новой пользовательской сессии
    public String addNewUserSession(){
        String newSessId = newUserSessionId();
        userSessions.put(newSessId, new HashMap<>());
        userSessions.get(newSessId).put("lastTime", (Object)getCurrentTimeStamp());

        return newSessId;
    }

    // Пока под вопросом для данной механики... возможно, здесь будет выполнение фоновых внутренних задач сервера...
    public boolean backgroundProcessing(){
        System.out.println("Platform is working");

        return true;
    }

    // Получить текущий timestamp (Unix-формат)
    public long getCurrentTimeStamp(){
        return System.currentTimeMillis() / 1000;
    }

    // Генерация UUID
    public String generateUUID(Random rng, String characters, int length)
    {
        char[] text = new char[length];
        for (int i = 0; i < length; i++)
        {
            text[i] = characters.charAt(rng.nextInt(characters.length()));
        }
        return new String(text);
    }
}
