export const kafkaConfig = {
  clientId: 'attendance-system',
brokers: [process.env.KAFKA_BROKERS || 'kafka:9092'],
};
