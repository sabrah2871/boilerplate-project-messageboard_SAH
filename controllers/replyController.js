const Reply = require('../models/replyModel');
const Thread = require('../models/threadModel');

exports.readReply = async (req, res) => {
  try {
    const posts = await Reply.find({thread_id:req.query.thread_id}).select('_id text created_on');
    try {
      const data = await Thread.findOne({_id:req.query.thread_id}).select('_id text created_on bumped_on replies');
      data.replies = posts;
      res.status(200).json(data);
    } catch (err) {
      res.status(500).json({ message: err.message });  
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createReply = async (req, res) => {
  const {thread_id, text, delete_password} = req.body;
  const reply = new Reply({
    thread_id: thread_id,
    text: text,
    delete_password: delete_password
  });

  try {
    const savedReply = await reply.save();
    try {
      await Thread.findByIdAndUpdate(
        thread_id,
        {bumped_on: savedReply.created_on},
        { new: true, runValidators: true }
      );
      res.status(302).redirect(`/b/${req.params.board}/${thread_id}`);
    } catch (err) {
      res.status(400).json({ message: err.message });  
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteReply = async (req, res) => {
  const {reply_id, delete_password} = req.body;

  try {
    const foundItem = await Reply.findById(reply_id);
    if (foundItem.delete_password === delete_password){
      try {
        await Reply.findByIdAndUpdate(
          reply_id,
          {text: '[deleted]'},
          { new: true, runValidators: true }
          );
        res.status(200).send('success');
      } catch {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.status(401).send('incorrect password');
    };
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateReply = async (req, res) => {
  let reply_id = req.body.reply_id;
  let updates = {reported: true};

  try {
    await Reply.findByIdAndUpdate(
      reply_id,
      updates,
      { new: true, runValidators: true }
    );
    res.status(200).send('reported');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
