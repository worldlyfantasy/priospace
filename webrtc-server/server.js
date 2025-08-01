const WebSocket = require("ws");

class SignalingServer {
  constructor(port = 3001) {
    this.port = port;
    this.wss = new WebSocket.Server({ port: this.port });
    this.rooms = new Map(); // roomId -> Set of client objects
    this.clients = new Map(); // ws -> { id, roomId }

    this.setupServer();
    console.log(`🚀 WebRTC Signaling Server running on port ${this.port}`);
    console.log(`📡 Ready to facilitate peer-to-peer connections!`);
  }

  setupServer() {
    this.wss.on("connection", (ws) => {
      const clientId = this.generateClientId();
      const client = { id: clientId, roomId: null, ws: ws };
      this.clients.set(ws, client);

      console.log(`✅ Client ${clientId} connected`);

      ws.on("message", (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error("❌ Error parsing message:", error);
          this.sendError(ws, "Invalid message format");
        }
      });

      ws.on("close", () => {
        this.handleDisconnect(ws);
      });

      ws.on("error", (error) => {
        console.error("❌ WebSocket error:", error);
        this.handleDisconnect(ws);
      });
    });
  }

  generateClientId() {
    return Math.random().toString(36).substring(2, 15);
  }

  handleMessage(ws, data) {
    const client = this.clients.get(ws);
    if (!client) return;

    console.log(`📨 Message from ${client.id}:`, data.type);

    switch (data.type) {
      case "create-room":
        this.handleCreateRoom(ws, data);
        break;

      case "join-room":
        this.handleJoinRoom(ws, data);
        break;

      case "leave-room":
        this.handleLeaveRoom(ws);
        break;

      case "offer":
        this.handleOffer(ws, data);
        break;

      case "answer":
        this.handleAnswer(ws, data);
        break;

      case "ice-candidate":
        this.handleIceCandidate(ws, data);
        break;

      default:
        console.log("⚠️  Unknown message type:", data.type);
        this.sendError(ws, "Unknown message type");
    }
  }

  handleCreateRoom(ws, data) {
    const client = this.clients.get(ws);
    const { roomId } = data;

    if (!roomId) {
      this.sendError(ws, "Room ID is required");
      return;
    }

    // Check if room already exists
    if (this.rooms.has(roomId)) {
      this.sendError(ws, "Room already exists");
      return;
    }

    // Create new room
    const room = new Set();
    room.add(client);
    this.rooms.set(roomId, room);
    client.roomId = roomId;

    console.log(`🏠 Room ${roomId} created by ${client.id}`);

    // Confirm room creation
    ws.send(
      JSON.stringify({
        type: "room-created",
        roomId: roomId,
      })
    );

    // Send empty peers list initially
    this.sendPeersList(ws, roomId);
  }

  handleJoinRoom(ws, data) {
    const client = this.clients.get(ws);
    const { roomId } = data;

    if (!roomId) {
      this.sendError(ws, "Room ID is required");
      return;
    }

    // Check if room exists
    if (!this.rooms.has(roomId)) {
      this.sendError(ws, "Room not found");
      return;
    }

    const room = this.rooms.get(roomId);

    // Check room capacity (limit to 10 users per room)
    if (room.size >= 10) {
      this.sendError(ws, "Room is full");
      return;
    }

    // Add client to room
    room.add(client);
    client.roomId = roomId;

    console.log(`👥 Client ${client.id} joined room ${roomId}`);

    // Notify all clients in room about new peer
    this.broadcastToRoom(
      roomId,
      {
        type: "peer-joined",
        peer: { id: client.id },
      },
      client.id
    );

    // Send peers list to new client
    this.sendPeersList(ws, roomId);
  }

  handleLeaveRoom(ws) {
    const client = this.clients.get(ws);
    if (!client || !client.roomId) return;

    this.removeClientFromRoom(client);
  }

  handleOffer(ws, data) {
    const client = this.clients.get(ws);
    const { offer, roomId, to } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    // Forward offer to specific peer
    const targetClient = this.findClientInRoom(roomId, to);
    if (targetClient) {
      targetClient.ws.send(
        JSON.stringify({
          type: "offer",
          offer: offer,
          from: client.id,
        })
      );
      console.log(`🤝 Offer forwarded from ${client.id} to ${to}`);
    } else {
      this.sendError(ws, "Target peer not found");
    }
  }

  handleAnswer(ws, data) {
    const client = this.clients.get(ws);
    const { answer, roomId, to } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    // Forward answer to specific peer
    const targetClient = this.findClientInRoom(roomId, to);
    if (targetClient) {
      targetClient.ws.send(
        JSON.stringify({
          type: "answer",
          answer: answer,
          from: client.id,
        })
      );
      console.log(`✅ Answer forwarded from ${client.id} to ${to}`);
    } else {
      this.sendError(ws, "Target peer not found");
    }
  }

  handleIceCandidate(ws, data) {
    const client = this.clients.get(ws);
    const { candidate, roomId } = data;

    if (!client || client.roomId !== roomId) {
      this.sendError(ws, "Not in specified room");
      return;
    }

    // Broadcast ICE candidate to all other peers in room
    this.broadcastToRoom(
      roomId,
      {
        type: "ice-candidate",
        candidate: candidate,
        from: client.id,
      },
      client.id
    );

    console.log(`🧊 ICE candidate broadcasted from ${client.id}`);
  }

  handleDisconnect(ws) {
    const client = this.clients.get(ws);
    if (!client) return;

    console.log(`❌ Client ${client.id} disconnected`);

    // Remove from room if in one
    if (client.roomId) {
      this.removeClientFromRoom(client);
    }

    // Remove from clients map
    this.clients.delete(ws);
  }

  removeClientFromRoom(client) {
    const { roomId } = client;
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (!room) return;

    // Remove client from room
    room.delete(client);

    // Notify other clients about peer leaving
    this.broadcastToRoom(
      roomId,
      {
        type: "peer-left",
        peerId: client.id,
      },
      client.id
    );

    // Clean up empty room
    if (room.size === 0) {
      this.rooms.delete(roomId);
      console.log(`🗑️  Room ${roomId} deleted (empty)`);
    }

    client.roomId = null;
    console.log(`👋 Client ${client.id} left room ${roomId}`);
  }

  findClientInRoom(roomId, clientId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    for (const client of room) {
      if (client.id === clientId) {
        return client;
      }
    }
    return null;
  }

  sendPeersList(ws, roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const client = this.clients.get(ws);
    const peers = Array.from(room)
      .filter((c) => c.id !== client.id)
      .map((c) => ({ id: c.id }));

    ws.send(
      JSON.stringify({
        type: "peers-list",
        peers: peers,
      })
    );
  }

  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const client of room) {
      if (excludeClientId && client.id === excludeClientId) continue;

      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    }
  }

  sendError(ws, message) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(
        JSON.stringify({
          type: "error",
          message: message,
        })
      );
    }
  }

  // Utility methods for monitoring
  getRoomStats() {
    const stats = {
      totalRooms: this.rooms.size,
      totalClients: this.clients.size,
      rooms: {},
    };

    for (const [roomId, room] of this.rooms) {
      stats.rooms[roomId] = {
        clientCount: room.size,
        clients: Array.from(room).map((c) => c.id),
      };
    }

    return stats;
  }

  printStats() {
    const stats = this.getRoomStats();
    console.log("\n📊 Server Stats:");
    console.log(`   Total Rooms: ${stats.totalRooms}`);
    console.log(`   Total Clients: ${stats.totalClients}`);

    if (stats.totalRooms > 0) {
      console.log("   Room Details:");
      for (const [roomId, roomData] of Object.entries(stats.rooms)) {
        console.log(`     ${roomId}: ${roomData.clientCount} clients`);
      }
    }
    console.log("");
  }
}

// Create and start the server
const server = new SignalingServer(3001);

// Optional: Print stats every 30 seconds
setInterval(() => {
  const stats = server.getRoomStats();
  if (stats.totalClients > 0) {
    server.printStats();
  }
}, 30000);

// Graceful shutdown
process.on("SIGINT", () => {
  console.log("\n🛑 Shutting down signaling server...");
  server.wss.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });
});

process.on("SIGTERM", () => {
  console.log("\n🛑 Shutting down signaling server...");
  server.wss.close(() => {
    console.log("✅ Server closed gracefully");
    process.exit(0);
  });
});

module.exports = SignalingServer;
