import { Kafka } from 'kafkajs';
import { kafkaConfig } from './config.js';

const kafka = new Kafka(kafkaConfig);
const producer = kafka.producer();

export async function produceMessage(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
  await producer.disconnect();
}
