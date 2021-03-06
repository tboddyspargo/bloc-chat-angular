(function() {
  function MessageService ($firebaseArray, RoomService, UserDataService) {
    let Messages = {};
    const ref = firebase.database().ref('messages');

    /**
     * Adds a message to the provided room, setting the provided user as the author.
     * @param  {Message} message A message object to submit.
     * @param  {Room} room    A room object that the message will be associated with.
     * @param  {User} user    A user object to associate with the message (as author).
     */
    Messages.add = function (message, room, user) {
      message.author = user.uid;
      message.dateSubmitted = (new Date()).valueOf();
      return this[room.$id].$add(message)
        .then((ref) => {
          RoomService.updateLastMessage(room, message, this[room.$id]);
          console.log("Added record with id", ref.key);
        })
        .catch((error) => {
          console.log("Failed to submit post", error);
        });
    };
    
    /**
     * Function to retrieve the messages for a particular chatroom.
     * @param  {Number} roomId The ID of the room to retrieve messages for.
     * @return {Messages}      The messages for the room.
     */
    Messages.get = function (roomId) {
      if (!this[roomId]) {
        this[roomId] = $firebaseArray(ref.child(roomId));
        this[roomId].$loaded()
          .then(() => {
            console.log('Retrieved messages for room', roomId);
            Messages[roomId].allowed = true;
          }).catch((error) => {
            console.log("Failed to retrieve messages", error);
          });
      }
      return this[roomId];
    };

    /**
     * Empty the message arrays.
     */
    Messages.reset = function () {
      for (let item in this) {
        if (typeof this[item] !== 'function' && this[item].$destroy) {
          this[item].$destroy();
          this[item] = null;
        }
      }
    }

    return Messages;
  }

  angular
    .module('chatterBox')
    .factory('MessageService', ['$firebaseArray','RoomService', 'UserDataService', MessageService]);
})();
