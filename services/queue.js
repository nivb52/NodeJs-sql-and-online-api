// Queues

module.exports = { createQueue };

function createQueue() {
  const queue = [];
  const token = function() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return (
      "_" +
      Math.random()
        .toString(36)
        .substr(2, 9)
    );
  };

  return {
    enqueue(item) {
      queue.unshift({ item, token });
    },

    dequeue() {
      queue.pop();
    },

    peek() {
      return queue[queue.length - 1];
    },

    get length() {
      return queue.length;
    },

    isEmpty() {
      return queue.length === 0;
    },

    len() {
      return queue.length;
    }
  };
}
