import CallNotifications from "@/components/CallNotifications";
import ListOnlineUsers from "@/components/ListOnlineUsers";
import VideoCall from "@/components/VideoCall";

export default function Home() {
  return (
    <div className="container mx-auto mt-5">
      <ListOnlineUsers />
      <CallNotifications />
      <VideoCall />
    </div>
  );
}
