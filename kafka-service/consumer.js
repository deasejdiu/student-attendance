import { Kafka } from 'kafkajs';
import { kafkaConfig } from './config.js';
import { TOPICS } from './topics.js';

const kafka = new Kafka(kafkaConfig);
const consumer = kafka.consumer({ groupId: 'attendance-group' });

export async function startConsumer() {
  await consumer.connect();
  await consumer.subscribe({ topic: TOPICS.ATTENDANCE_RECORDED, fromBeginning: false });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      console.log(`Received: ${message.value.toString()}`);
    },
  });
}
