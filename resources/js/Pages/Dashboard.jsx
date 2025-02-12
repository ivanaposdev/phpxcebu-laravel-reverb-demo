import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import { useEffect, useRef, useState } from "react";

export default function Dashboard() {
  const {
    auth: { user },
    messages: _messages,
    errors,
  } = usePage().props;

  const messageBoxRef = useRef(null);

  const [messages, setMessages] = useState(_messages);

  const {
    data,
    processing,
    clearErrors,
    reset,
    setData,
  } = useForm({ message: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    clearErrors();

    // Were using the manual visit here so the page won't refresh
    router.post('/send', data, {
      onSuccess: () => reset(),
    })
  }

  useEffect(() => {
    const channel = window.Echo.channel("message");

    channel.listen("MessageCreatedEvent", (newMessage) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        newMessage.message,
      ]);
    });

    return () => {
      channel.unsubscribe();
    };
  }, []);

  useEffect(() => {
    messageBoxRef.current?.scrollTo({
      top: messageBoxRef.current?.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  const messageList = messages.map((message) => {
    const isMe = message.user_id === user.id;
    return (
      <div key={message.id} className={`mb-4 ${isMe ? 'text-right' : ''}`}>
        {!isMe && <div className="text-xs text-gray-800 mx-3">{message.user?.name}</div>}
        <div className={`inline-block px-5 py-2 rounded-lg ${isMe ? 'bg-indigo-500 text-white' : 'bg-gray-200 text-gray-800'} `}>
          <p>{message.text}</p>
          <span className="text-[10px]">
            {message.created_at}
          </span>
        </div>
      </div>
    )
  });

  return (
    <AuthenticatedLayout
      header={
        <h2 className="text-xl font-semibold leading-tight text-gray-800">
          Dashboard
        </h2>
      }
    >
      <Head title="Dashboard" />

      <div className="py-12">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6 text-gray-900">
              <div className="pt-1">
                <div>#Reverb</div>

                <div className="flex flex-col h-[500px]">
                  <div ref={messageBoxRef} className="overflow-y-auto p-4 mt-3 flex-grow border-t border-gray-200">
                    {messageList}
                  </div>

                  <form onSubmit={handleSubmit}>
                    <div className="flex items-center">
                      <input
                        type="text"
                        className="flex-1 border p-3 rounded-lg"
                        placeholder="Message #Reverb"
                        value={data.message}
                        max={255}
                        onChange={(e) => setData('message', e.target.value)}
                      />
                      <button
                        type="submit"
                        className="ml-2 bg-indigo-500 text-white p-3 rounded-lg shadow hover:bg-indigo-600 transition duration-300 flex items-center justify-center"
                        disabled={processing}
                      >
                        <i className="fas fa-paper-plane"></i>
                        <span className="ml-2">
                          Send
                        </span>
                      </button>
                    </div>
                    {errors.message && <div className="text-red-500 text-sm">{errors.message}</div>}
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
