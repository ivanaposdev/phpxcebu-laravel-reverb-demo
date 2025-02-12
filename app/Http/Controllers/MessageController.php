<?php

namespace App\Http\Controllers;

use App\Events\MessageCreated;
use App\Events\MessageCreatedEvent;
use App\Models\Message;
use Illuminate\Http\Request;
use Inertia\Inertia;

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

        broadcast(new MessageCreatedEvent($message->load('user')->toArray()));
    }
}
