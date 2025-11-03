import React, { useState } from 'react';
import { NPC } from 'shared';
import { webSocketClient } from '../../services/webSocketClient';

interface DialogueComponentProps {
  npc: NPC;
  onClose: () => void;
}

const DialogueComponent: React.FC<DialogueComponentProps> = ({ npc, onClose }) => {
  const [messages, setMessages] = useState<{ author: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const playerMessage = { author: 'Player', text: input };
    setMessages((prev) => [...prev, playerMessage]);

    const npcResponse = await webSocketClient.sendNpcMessage(npc.id, input);
    setMessages((prev) => [...prev, { author: npc.name, text: npcResponse }]);

    setInput('');
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '80%',
        maxWidth: '600px',
        height: '300px',
        backgroundColor: 'white',
        border: '1px solid black',
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div style={{ padding: '10px', borderBottom: '1px solid black' }}>
        <h3>{npc.name}</h3>
        <button onClick={onClose} style={{ float: 'right' }}>
          Close
        </button>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
        {messages.map((msg, index) => (
          <div key={index}>
            <strong>{msg.author}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', padding: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ flex: 1, marginRight: '10px' }}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default DialogueComponent;
