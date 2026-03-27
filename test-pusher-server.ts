import Pusher from 'pusher';
try {
  new Pusher({
    appId: '',
    key: '',
    secret: '',
    cluster: '',
    useTLS: true,
  });
  console.log("Success");
} catch (e: any) {
  console.log(e.message);
}
