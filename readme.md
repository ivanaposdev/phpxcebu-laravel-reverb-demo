# Building a Real-time Chat App with Laravel Reverb

Want to add real-time chat to your app? With Laravel Reverb, it's easier than ever. No more relying on third-party services, complex server setups, or inefficient polling hacks—Reverb is a first-party WebSocket server designed for seamless real-time communication. Let’s build it the right way!

# Background
- When was reverb created?
- what problems does it solve

What is Polling?


# Let's build it!

## Install Laravel
https://laravel.com/docs/11.x/installation  
I prefer installing using the Starter Kit https://laravel.com/docs/11.x/starter-kits#breeze-and-inertia - Laravel Breeze with Ineria and React 

## Create the Models and Migrations

```
php artisan make:model Message -m
```


The schema for the messages table will look like this:
```php
Schema::create('messages', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id');
    $table->text('text');
    $table->timestamps();
});
```

And its Model will look like this:

```php
class Message extends Model
{
    protected $fillable = [
        'user_id',
        'text'
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
```

## Create the Routes

We'll only need two routes for this demo.

one to display the chat box `/dashboard` and one to send a message `'/send`.

We will create the Controllers later.

```php
...
Route::middleware(['auth', 'verified'])->group(function () {
    ...
    Route::get('/dashboard', [MessageController::class, 'index'])->name('dashboard');
    Route::post('/send', [MessageController::class, 'send']);
    ...
});
...
```


## Create the Controllers


```
php artisan make:controller MessageController
```

It should contain:

```php
...
class MessageController extends Controller
{
    public function index()
    {
        $messages = Message::with('user')->get();

        return Inertia::render('Dashboard', [
            'messages' => $messages,
        ]);
    }

    public function send(Request $request)
    {
        $validated = $request->validate([
            'message' => 'required|max:255',
        ]);

        $message = $request->user()
            ->messages()
            ->create(['text' => $validated['message']]);
    }
}
...
```



## Install Reverb
> https://laravel.com/docs/11.x/reverb#installation


You may install Reverb using the install:broadcasting Artisan command:
```
php artisan install:broadcasting
```

## Create the Event

```
php artisan make:event MessageCreatedEvent
```

This should be located in `app\Events\MessageCreatedEvent.php`

Edit this file, it should have the following content:

```diff
...
- class MessageCreatedEvent
+ class MessageCreatedEvent implements ShouldBroadcastNow
{
    ...
-   public function __construct()
+   public function __construct(public array $message)
    {
        //
    }
    ...
    public function broadcastOn(): array
    {
+       return [
+           new Channel('message'),
+       ];
    }
    ...
}
...


```

- Note that `MessageCreatedEvent` implements `ShouldBroadcastNow`
- We are passing the `$message` as an array
- We are using the channel `message`


Then in `routes\channels.php` we'll add the following:

```php
Broadcast::channel('message', function () {
    return true;
});
```

here we can configure the channel access controls, for this demo we'll just allow all users to access the channel.

Let's go back to our `MessageController` controller

and add a line

```php 
broadcast(new MessageCreatedEvent($message->load('user')->toArray()));
```


## Create the Views

The view is gonna be simple, we'll just edit the current `Dashboard` view located in `resources\js\Pages\Dashboard.jsx`.

<Link to Dashboard.jsx>



---

Credits:
https://medium.com/@emreensr
https://www.youtube.com/@LaravelDaily
