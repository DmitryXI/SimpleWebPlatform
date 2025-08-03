import org.json.JSONArray;
import org.json.JSONObject;

import java.lang.reflect.Method;
import java.util.*;
//import games.*;


// Класс ядра платформы
public class CorePlatform {

    private Random rnd = new Random();                                                          // Рандомайзер
    private HashMap<String, Method> coreMethodsNames = new HashMap<>();                         // Список методов доступных для вызова запросом от клиента
    private HashMap<String, HashMap<String, Object>> usersSessions = new HashMap<>();           // Список сессий пользователей
    private HashMap<String, HashMap<String, Object>> gamesSessions = new HashMap<>();           // Список игровых сессий
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

    // Запрос запуска игровой сессии
    public String req_runGame(JSONObject request){

        HashMap usess;
        String skippedExpected;

        // Проверяем наличие ожидаемых полей
        if (!(skippedExpected = checkExpectedFields(request, new String[]{"action","usessid","gameId","joinType"})).equals("")) { return "{\"error\":true,\"code\":12,\"text\":\"Not set expected field "+skippedExpected+"\"}"; }
        // Проверяем регистрацию сессии пользователя (на этом этапе уже должна быть)
        if ((usess = getUserSessionById((String) request.get("usessid"))) == null) { return "{\"error\":true,\"code\":11,\"text\":\"User session not registered\"}"; }

        HashMap<String, Object> gameSession = null;

        if (request.get("joinType").equals("new")) {
            gameSession = addNewGameSession((String) request.get("gameId"));
        }else{
            // Not ready yet...
        }

        if (gameSession == null) { return "{\"error\":true,\"code\":13,\"text\":\"Game session not registered\"}"; }


        // Implementation here...

        return "{\"error\":true,\"code\":0,\"text\":\"Debug...\"}";
    }

    // Запрос формы выбора игровой сессии
    public String req_getGameSessionForm(JSONObject request){

        HashMap usess;
        String skippedExpected;

        // Проверяем наличие ожидаемых полей
        if (!(skippedExpected = checkExpectedFields(request, new String[]{"action","usessid","gameId"})).equals("")) { return "{\"error\":true,\"code\":12,\"text\":\"Not set expected field "+skippedExpected+"\"}"; }
        // Проверяем регистрацию сессии пользователя (на этом этапе уже должна быть)
        if ((usess = getUserSessionById((String) request.get("usessid"))) == null) { return "{\"error\":true,\"code\":11,\"text\":\"User session not registered\"}"; }

        usess.put("gId", request.get("gameId"));

        JSONObject form = new JSONObject();
        form.putOnce("formId", "slgSesFrm");
        form.putOnce("for", "runGame");
        form.putOnce("gameId", request.get("gameId"));
        form.putOnce("expected", (new JSONArray()).put("usessid").put("gameId").put("joinType"));

        return form.toString();
    }

    // Запрос формы выбора игры
    public String req_getSelectGameForm(JSONObject request){

        // Проверяем регистрацию сессии пользователя (на этом этапе уже должна быть)
        if (request.keySet().contains("usessid")) {
            if (!usersSessions.containsKey(request.get("usessid"))) {
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
                    gamesJSON.putOnce((String) gameKey, (new JSONObject()).putOnce("gId", gamesList.get(gameKey).get("gId")).putOnce("name", gamesList.get(gameKey).get("name")));
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
            if (!usersSessions.containsKey(request.get("usessid"))) {
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

    // Проверить наличие ожидаемых полей в запросе
    public String checkExpectedFields(JSONObject request, String[] fields){

        if (fields.length > 0) {
            Set keys = request.keySet();
            for (String field : fields) {
                if (!keys.contains(field)) {
                    return field;
                }
            }
        }

        return "";
    }

    // Генерация нового уникального ID пользовательской сессии
    private String newUserSessionId(){
        String newUUID = generateUUID(rnd, UUIDChars, usessUUIDLen);

        while (usersSessions.containsKey(newUUID)){
            newUUID = generateUUID(rnd, UUIDChars, usessUUIDLen);
        }

        return newUUID;
    }

    // Получить пользовательскую сессиию по ID
    public HashMap<String, Object> getUserSessionById(String id){

        if (usersSessions.containsKey(id)) {
            return usersSessions.get(id);
        }else {
            return null;
        }
    }

    // Обновление пользовательской сессии
    public Boolean refreshUserSession(String id){

        if (usersSessions.containsKey(id)) {
            usersSessions.get(id).replace("lastTime", (Object)getCurrentTimeStamp());
            System.out.println("Refreshed user session: "+id);
        }

        return false;
    }

    // Создание новой пользовательской сессии
    public String addNewUserSession(){
        String newSessId = newUserSessionId();
        usersSessions.put(newSessId, new HashMap<>());
        usersSessions.get(newSessId).put("lastTime", (Object)getCurrentTimeStamp());

        return newSessId;
    }

    // Получить игровую сессиию по ID
    public HashMap<String, Object> getGameSessionById(String id){

        if (gamesSessions.containsKey(id)) {
            return gamesSessions.get(id);
        }else {
            return null;
        }
    }

    // Создание новой игровой сессии
    public HashMap<String, Object> addNewGameSession(String gId){
        String newSessId = newUserSessionId();
        gamesSessions.put(newSessId, new HashMap<>());

        HashMap<String, Object> gameSession = gamesSessions.get(newSessId);

        gameSession.put("createTime", (Object)getCurrentTimeStamp());
        gameSession.put("lastTime", (Object)getCurrentTimeStamp());
        gameSession.put("gId", gId);
        gameSession.put("players", new HashMap<>());

        return gameSession;
    }

    // Пока под вопросом для данной механики... возможно, здесь будет выполнение фоновых внутренних задач сервера...
    public boolean backgroundProcessing(){
        System.out.println(java.time.LocalDateTime.now()+": platform is working");

        // Удаляем устаревшие сессии
        if (usersSessions.size() > 0) {
            Long cTime = getCurrentTimeStamp();
            Object[] userSessionsKeys = usersSessions.keySet().toArray();

            for (Object usessid : userSessionsKeys){
                System.out.println("Exists session "+usessid+" with last time "+ usersSessions.get(usessid).get("lastTime")+" and current time "+cTime);
                if ((cTime - (long)(usersSessions.get(usessid).get("lastTime"))) > userSessionTimeToLive) {
                    usersSessions.remove(usessid);
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
