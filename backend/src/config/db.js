import mongoose from 'mongoose';
import Student from '../models/Student.js';

const syncStudentIndexes = async () => {
  try {
    const collection = Student.collection;
    const indexes = await collection.indexes();
    const oldIndex = indexes.find(
      (idx) =>
        idx.key?.sessionId === 1 &&
        idx.key?.class === 1 &&
        idx.key?.rollNo === 1 &&
        !idx.partialFilterExpression
    );
    if (oldIndex) {
      await collection.dropIndex(oldIndex.name);
      console.log('Dropped legacy student rollNo index');
    }
    await Student.syncIndexes();
  } catch (err) {
    console.warn('Student index sync warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await syncStudentIndexes();
  } catch (error) {
    console.error(`Database connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
