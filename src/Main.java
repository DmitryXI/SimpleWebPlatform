public class Main {

    public static void main(String[] args) {

        System.out.println("Starting platform");

        CorePlatform   core = new CorePlatform();

        if (core.addGame("Tictactoe", "Крестики-нолики")){ System.out.println("Добавлена игра Крестики-нолики"); }else { System.err.println("Error 7: Can't add game"); }
        if (core.addGame("SeaBattle", "Морской бой")){ System.out.println("Добавлена игра Морской бой"); }else { System.err.println("Error 7: Can't add game"); }

        WebServerSync web  = new WebServerSync();
        web.run(core);
    }


}