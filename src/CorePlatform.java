import netscape.javascript.JSObject;
import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.*;
import java.sql.Timestamp;
//import games.*;


// Класс ядра платформы
public class CorePlatform {

    private Random rnd = new Random();                                                          // Рандомайзер
    private HashMap<String, Method> coreMethodsNames = new HashMap<>();                         // Список методов доступных для вызова запросом от клиента
    private HashMap<String, HashMap<String, Object>> userSessions = new HashMap<>();            // Список сессий пользователей
    private Integer usessUUIDLen = 12;                                                          // Длина идентификатора сессии пользователя в символах
    private String UUIDChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";                          // Набор символов для генерации UUID'ов
    private Integer userSessionTimeToLive = 600;                                                // Время жизни сессии пользователя в секундах
    private HashMap<String, HashMap<String, Object>> gamesList = new HashMap<>();               // Список доступных игр

    // Создание объекта ядра
    public CorePlatform(){
        Method[] methods = this.getClass().getMethods();

        for (Method method : methods){
            if (method.getName().substring(0,4).equals("req_")) {
                coreMethodsNames.put(method.getName().toLowerCase(), method);
                System.out.println("Method "+method.getName()+" listed from core");
            }
        }
    }

    // Создание объекта игры и его регистрация
    public boolean addGame(String gId, String name){

//        char[] tmp = gId.toLowerCase().toCharArray();
//        tmp[0] = String.valueOf(tmp[0]).toUpperCase().charAt(0);
//        gId = String.valueOf(tmp);

        if (gamesList.containsKey(gId)) {
            System.err.println("Error 6: Game with name \""+gId+"\" already registred");
            return false;
        }

        HashMap<String, Object> game = new HashMap<>();
        try {
//            Class clazz = Class.forName("games."+name);
//            Class[] parameters = new Class[] {String.class, String.class};
//            Constructor constructor = clazz.getConstructor(parameters);
//            Object o = constructor.newInstance(new Object[] {"one", "two"});
            game.put("obj", Class.forName("games."+gId).newInstance());
            game.put("id", gId);
            game.put("name", name);
        }catch (Exception e){
            System.err.println("Error 8: can't find class \""+gId+"\"");
            return false;
        }

        Method[] methods = game.get("obj").getClass().getMethods();

        String methodAPIName;
        for (Method method : methods){
            if (method.getName().substring(0,4).equals("req_")) {
                methodAPIName = "req_"+gId+"_"+method.getName().substring(4);
                coreMethodsNames.put(methodAPIName, method);
                System.out.println("Method "+methodAPIName+" for "+gId+"->"+method.getName().toLowerCase()+" listed from core");
            }
        }

        this.gamesList.put(gId, game);

        return true;
    }

    // Запрос формы выбора игры
    public String req_getSelectGameForm(JSONObject request){

        // Проверяем регистрацию сессии пользователя (на этом этапе уже должна быть)
        if (request.keySet().contains("usessid")) {
            if (!userSessions.containsKey(request.get("usessid"))) {
                return "{\"error\":true,\"code\":11,\"text\":\"User session not registered\"}";
            }
        }else {
            return "{\"error\":true,\"code\":10,\"text\":\"User session not set\"}";
        }

        if (request != null) {
            HashMap usess = getUserSessionById((String) request.get("usessid"));

            usess.put("name", request.get("login"));

            Object[] gamesKeys = gamesList.keySet().toArray();

            // Перебираем список зарегистрированных игр
            if (gamesKeys.length > 0) {

                JSONObject form = new JSONObject();
                JSONObject gamesJSON = new JSONObject();

                form.putOnce("formId", "slgFrm");
                form.putOnce("for", "getGameSessionForm");
                form.putOnce("expected", (new JSONArray()).put("usessid").put("gameId"));

                for (Object gameKey : gamesKeys){
                    gamesJSON.putOnce((String) gameKey, (new JSONObject()).putOnce("gId", gamesList.get(gameKey).get("gId")).putOnce("name", gamesList.get(gameKey).get("name")).toString());
                    System.out.println("Game in list: "+gamesList.get(gameKey).get("name") + "("+gamesList.get(gameKey).get("gId")+")");
                }

                form.putOnce("games", gamesJSON);

                return form.toString();
            }

            return "{\"error\":true,\"code\":9,\"text\":\"Games list is empty\"}";
        }else {
            return "{\"error\":true,\"code\":5,\"text\":\"Error\"}";
        }
    }

    // Запрос формы входа/аутентификации
    public String req_getEntranceForm(JSONObject request){

        // Проверяем регистрацию сессии пользователя (на этом этапе уже должна быть)
        if (request.keySet().contains("usessid")) {
            if (!userSessions.containsKey(request.get("usessid"))) {
                return "{\"error\":true,\"code\":11,\"text\":\"User session not registered\"}";
            }
        }else {
            return "{\"error\":true,\"code\":10,\"text\":\"User session not set\"}";
        }

        JSONObject form = new JSONObject();

        form.putOnce("formId", "etrFrm");
        form.putOnce("for", "getSelectGameForm");
        form.putOnce("expected", (new JSONArray()).put("usessid").put("login"));

        JSONArray elements = new JSONArray();
        elements.put((new JSONObject()).putOnce("id","core_login").putOnce("type","text").putOnce("value","Login"));
        elements.put((new JSONObject()).putOnce("id","core_login_btn").putOnce("type","button").putOnce("value","Enter"));

        form.putOnce("elements", elements);
        return form.toString();
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

    // Получить пользовательскую сессиию по ID
    public HashMap<String, Object> getUserSessionById(String id){

        if (userSessions.containsKey(id)) {
            return userSessions.get(id);
        }else {
            return null;
        }
    }

    // Обновление пользовательской сессии
    public Boolean refreshUserSession(String id){

        if (userSessions.containsKey(id)) {
            userSessions.get(id).replace("lastTime", (Object)getCurrentTimeStamp());
            System.out.println("Refreshed user session: "+id);
        }

        return false;
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
        System.out.println(java.time.LocalDateTime.now()+": platform is working");

        // Удаляем устаревшие сессии
        if (userSessions.size() > 0) {
            Long cTime = getCurrentTimeStamp();
            Object[] userSessionsKeys = userSessions.keySet().toArray();

            for (Object usessid : userSessionsKeys){
                System.out.println("Exists session "+usessid+" with last time "+userSessions.get(usessid).get("lastTime")+" and current time "+cTime);
                if ((cTime - (long)(userSessions.get(usessid).get("lastTime"))) > userSessionTimeToLive) {
                    userSessions.remove(usessid);
                    System.out.println("User session "+usessid+" removed from timeout");
                }
            }
        }

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
