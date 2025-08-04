import java.io.*;
import java.lang.reflect.Method;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import org.json.*;




public class WebServerSync {

    public CorePlatform core = null;
    public Integer httpPort = 80;
    public String  webDir = "./www";

    public void run(CorePlatform core) {

        setCore(core);

        try {
            ServerSocket serverSocket = new ServerSocket(httpPort);
            System.out.println("Server is listening on port " + httpPort);

            while (true) {
                if (core != null) {
                    core.backgroundProcessing();
                }

                Socket clientSocket = serverSocket.accept();
                handleClientRequest(clientSocket);
            }
        }catch (Exception e){
            System.err.println("Шибка создания серверного сокета");
            System.out.println(e);
            e.printStackTrace();
        }
    }

    // Привязываем объект ядра к объекту веб-сервера
    private boolean setCore(CorePlatform core){
        this.core = core;

        return true;
    }

    private void handleClientRequest(Socket clientSocket) throws IOException {
        BufferedReader in = new BufferedReader(new InputStreamReader(clientSocket.getInputStream()));
        PrintWriter out = new PrintWriter(clientSocket.getOutputStream(), true);
        OutputStream outStream = clientSocket.getOutputStream();

        String requestLine = in.readLine();
//        System.out.println("Received request: " + requestLine);

        if (requestLine != null) {

            String requestLineDecode = "";

            try {
                requestLineDecode = java.net.URLDecoder.decode(requestLine, StandardCharsets.UTF_8.name());
            } catch (UnsupportedEncodingException e) {
                System.err.println("Ошибка декодирования запроса клиента");
                requestLineDecode = "";
            }

            String[] requestParts = requestLineDecode.split(" ");
            String method = requestParts[0];
            String path = requestParts[1];
            String[] tmp = path.split("\\{");
            String getFile = tmp[0];
            String params = "";

            if (tmp.length > 1) {
                params = path.substring(getFile.length());
            }

            if ((getFile.length() - params.length()) > 0) {
                getFile = getFile.substring(0);
                tmp = getFile.split("\\?");
                if (tmp.length > 1) {
                    getFile = tmp[0];
                }
            }

            if (getFile.equals("/")) {
                getFile = "/index.html";
            }

//        System.out.println("getFile = "+getFile+"\nparams"+params+", file from "+webDir+getFile);

            if (params.length() > 1) {
                handleParamsRequest(params, out);
            } else if (method.equals("GET")) {
                handleGetRequest(path, webDir + getFile, out, outStream);
            } else if (method.equals("POST")) {
                handlePostRequest(in, out);
            }
        }

        in.close();
        out.close();
        clientSocket.close();
    }

    private void handleGetRequest(String webPath, String severPath, PrintWriter out, OutputStream outStream) {
        // Handle GET request

        File f = new File(severPath);
        if(!f.exists() || f.isDirectory()) {
            out.println("HTTP/1.1 404 NOT FOUND");
            out.println("Content-Type: text/html");
            out.println();
            out.println("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Error</title></head><body><pre>Cannot GET "+webPath+"</pre></body></html>");
            return;
        }

        try {
            InputStream inputStream = new FileInputStream(severPath);

            out.println("HTTP/1.1 200 OK");

            if (Arrays.asList("htm", "html", "css", "txt", "js").contains(getFileExtension(severPath))) {
                out.println("Content-Type: text/html");
//            } else if (getFileExtension(severPath) == "js") {
//                out.println("Content-Type: text/javascript");
            } else {
                out.println("Accept-ranges: bytes");
            }

            File file = new java.io.File(severPath);

            out.println("Content-length: "+file.length());
            out.println("Cache-control: no-store, no-cache, must-revalidate, max-age=0");
            out.println("pragma: no-cache");

            out.println();

            int data;
            byte[] chunk = new byte[8192];

            while ((data = inputStream.read(chunk)) != -1) {
                outStream.write(chunk);
            }
            out.println();
            inputStream.close();
        } catch (IOException e) {
            System.err.println("Ошибка чтения файла: "+severPath);
            e.printStackTrace();
            out.println("HTTP/1.1 500 Internal server error");
            out.println("Content-Type: text/html");
            out.println();
            out.println("<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"><title>Error</title></head><body><pre>Cannot GET "+webPath+"</pre></body></html>");
        }
    }

    private void handlePostRequest(BufferedReader in, PrintWriter out) throws IOException {
        // Handle POST request

        StringBuilder header = new StringBuilder();
        StringBuilder body   = new StringBuilder();
        String line;
        char[] c = new char[1048576];
        while ((line = in.readLine()) != null && !line.isEmpty()) {
            header.append(line).append("\n");
        }

        int len = in.read(c);
        if (len > 2) {
            body.append(c, 0, len);
            handleParamsRequest(body.toString(), out);
            return;
        }


        out.println("HTTP/1.1 200 OK");
        out.println("Content-Type: text/html");
        out.println();
        out.println("<html><body><h1>POST request received</h1><pre>" + header.toString() + "</pre></body></html>");

    }

    private void handleParamsRequest(String sParams, PrintWriter out) throws IOException {

        JSONObject params;

        try {
            params = new JSONObject(sParams);

            System.out.println(params);
        }catch (Exception e) {
            System.err.println("Ошибка разбора строки в JSON: "+sParams);
            out.println("HTTP/1.1 200 OK");
            out.println("Content-Type: text/html");
            out.println("Cache-control: no-store, no-cache, must-revalidate, max-age=0");
            out.println("pragma: no-cache");
            String content = "{\"error\":true,\"code\":1,\"text\":\"Error parsing json-params\"}";
            out.println("Content-length: " + content.getBytes().length);
            out.println();
            out.print(content);
            out.println();
            return;
        }

        Method req_method;
        if (params.keySet().contains("usessid")) {
            core.refreshUserSession(params.get("usessid").toString());
        }

        if (params.keySet().contains("action")) {
            if ((req_method = core.get_req_method("req_"+params.get("action").toString().toLowerCase())) != null) {
                String content;
                try {
                    content = (String) req_method.invoke(core, params);
//System.out.println("content = "+content);
//System.out.println("content length = "+content.length());
//System.out.println("content byte length = "+content.getBytes().length);
                }catch (Exception e){
                    System.err.println("Ошибка вызова метода: "+"req_"+params.get("action").toString().toLowerCase());
                    e.printStackTrace();
                    content = e.toString();
                }
                out.println("HTTP/1.1 200 OK");
                out.println("Content-Type: text/html");
                out.println("Cache-control: no-store, no-cache, must-revalidate, max-age=0");
                out.println("pragma: no-cache");
                out.println("Content-length: " + content.getBytes().length);
                out.println();
                out.println(content);
            } else {
                out.println("HTTP/1.1 200 OK");
                out.println("Content-Type: text/html");
                out.println("Cache-control: no-store, no-cache, must-revalidate, max-age=0");
                out.println("pragma: no-cache");
                String content = "{\"error\":true,\"code\":3,\"text\":\"Action not exists\"}";
                out.println("Content-length: " + content.getBytes().length);
                out.println();
                out.print(content);
                out.println();
            }
        }else {
            out.println("HTTP/1.1 200 OK");
            out.println("Content-Type: text/html");
            out.println("Cache-control: no-store, no-cache, must-revalidate, max-age=0");
            out.println("pragma: no-cache");
            String content = "{\"error\":true,\"code\":2,\"text\":\"No action\"}";
            out.println("Content-length: " + content.getBytes().length);
            out.println();
            out.print(content);
            out.println();
        }
    }

    private void responseFromRequest(PrintWriter out) throws IOException {

        out.println("HTTP/1.1 200 OK");
        out.println("Content-Type: text/html");
        out.println();
        out.println("<html><body><h1>Response...</h1></body></html>");
    }

    private String getFileExtension(String fullName){
        String extension = "";

        int i = fullName.lastIndexOf('.');
        int p = Math.max(fullName.lastIndexOf('/'), fullName.lastIndexOf('\\'));

        if (i > p) {
            extension = fullName.substring(i+1);
        }

        return extension;
    }
}