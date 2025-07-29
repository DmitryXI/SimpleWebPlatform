public class Main {

    public static void main(String[] args) {

        System.out.println("Starting platform");

        CorePlatform   core = new CorePlatform();

        System.out.println("New ID = "+core.addNewUserSession());


//        WebServerASync web  = new WebServerASync();
//        web.run();

        WebServerSync web  = new WebServerSync();
        web.run(core);
    }


}