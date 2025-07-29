import java.io.IOException;
import java.nio.ByteBuffer;
import java.util.concurrent.Future;
import java.nio.channels.AsynchronousServerSocketChannel;
import java.nio.channels.AsynchronousSocketChannel;
import java.util.concurrent.ExecutionException;
import java.net.InetSocketAddress;

public class WebServerASync {

    public void run(){
        try {
            AsynchronousServerSocketChannel serverChannel = AsynchronousServerSocketChannel.open();
            InetSocketAddress hostAddress = new InetSocketAddress("localhost", 80);
            serverChannel.bind(hostAddress);

            System.out.println("Server channel bound to port: " + hostAddress.getPort());
            System.out.println("Waiting for client to connect... ");

            Future acceptResult = serverChannel.accept();
            AsynchronousSocketChannel clientChannel = (AsynchronousSocketChannel) acceptResult.get();

            if ((clientChannel != null) && (clientChannel.isOpen())) {

                System.out.println("Client received");

                while (true) {
                    ByteBuffer buffer = ByteBuffer.allocate(32);
                    Future result = clientChannel.read(buffer);

                    while (!result.isDone()) {
//                        System.out.println("isDone");
                    }

                    buffer.flip();
                    String message = new String(buffer.array()).trim();
                    if (!message.equals("")) {
                        System.out.println(message);
                    }

                    buffer.clear();

                    if (!clientChannel.isOpen()) {
                        System.out.println("Client is lost");
                        break;
                    }
                }

                clientChannel.close();
            }

            serverChannel.close();
        }catch (Exception e){
            System.out.println(e);
        }
    }
}