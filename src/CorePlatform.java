import netscape.javascript.JSObject;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Objects;
import java.sql.Timestamp;
import java.util.Date;

public class CorePlatform {

    private ArrayList<String> coreMethodsNames = new ArrayList<>();
    private HashMap<Integer, HashMap<String, Object>> userSessions = new HashMap<>();

    public CorePlatform(){
        Method[] methods = this.getClass().getMethods();

        for (Method method : methods){
            if (method.getName().substring(0,4).equals("req_")) {
                coreMethodsNames.add(method.getName());
                System.out.println("Method "+method.getName()+" listed from core");
            }
        }
    }

    public boolean req_exists(String name){
        if (coreMethodsNames.contains(name)) {
            return true;
        }
        return false;
    }

    public Integer req_registration(JSObject request){
        return addNewUserSession();
    }

    private Integer newUserSessionId(){

        if (userSessions.size() > 0) {
            Object[] keys = userSessions.keySet().toArray();

            System.out.println("Last num = "+keys[keys.length-1]);

            return (Integer) keys[keys.length-1]+1;
        }else {
            return 0;
        }
    }

    public Integer addNewUserSession(){
        Integer newSessId = newUserSessionId();
        userSessions.put(newSessId, new HashMap<>());
        userSessions.get(newSessId).put("lastTime", (Object)getCurrentTimeStamp());

        return newSessId;
    }

    public boolean backgroundProcessing(){
        System.out.println("Platform is working");

        return true;
    }

    // Получить текущий timestamp (Unix-формат)
    public long getCurrentTimeStamp(){
        return System.currentTimeMillis() / 1000;
    }
}
