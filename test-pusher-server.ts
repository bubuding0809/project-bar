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
} catch (e) {
  console.log(e instanceof Error ? e.message : String(e));
}
