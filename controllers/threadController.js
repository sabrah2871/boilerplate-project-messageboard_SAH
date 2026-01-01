const Thread = require('../models/threadModel');

exports.readThreads = async (req, res) => {
  const board = req.params.board;
  const pipeline = [
    {$match: {board: board}},
    {$lookup: {
        from: 'replies',
        localField: '_id',
        foreignField: 'thread_id',
        as: 'replies'
    }},
    {$sort: {bumped_on: -1}},
    {$limit: 10},
    {$project: {
        _id: 1,
        text: 1,
        replies: 1,
        replycount: { $size: "$replies" },
        created_on: 1,
        bumped_on: 1,
    }}
  ];

  try {
    const data = await Thread.aggregate(pipeline);
    data.forEach(e => {
      e.replies = e.replies.slice(-3);
      e.replies.forEach(ee => {
        delete ee.delete_password;
        delete ee.reported;  
      });
    });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createThread = async (req, res) => {
  const thread = {
    board: req.params.board,
    text: req.body.text,
    delete_password: req.body.delete_password
  };

  try {
    await Thread.create(thread);
    res.status(303).redirect(`/b/${req.params.board}/`);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteThread = async (req, res) => {
  const {thread_id, delete_password} = req.body;

  try {
    const foundItem = await Thread.findById(thread_id);
    if (foundItem.delete_password === delete_password){
      try {
        await Thread.deleteOne({_id: thread_id});
        res.status(200).send('success');
      } catch {
        res.status(400).json({ message: err.message });
      }
    } else {
      res.status(401).send('incorrect password');
    }
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateThread = async (req, res) => {
  let thread_id = req.body.report_id;
  let updates = {reported: true};

  try {
    await Thread.findByIdAndUpdate(
      thread_id,
      updates,
      { new: true, runValidators: true }
    );
    res.status(200).send('reported');
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};
