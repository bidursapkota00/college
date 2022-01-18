import mongoose from 'mongoose';

const probabilitySchema = new mongoose.Schema({
  probability: { type: mongoose.Schema.Types.Mixed, required: true },
});

const Probability =
  mongoose.models.Probability ||
  mongoose.model('Probability', probabilitySchema);
export default Probability;
