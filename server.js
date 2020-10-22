let express = require('express');
let app = express();
let core = require('./core.js');
let _ = require('lodash');

let PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
  res.success = (data, message) => res.json({ success: 1, data, message });
  res.failed = (data, message) => res.json({ success: 0, data, message });

  next();
})

app.use(express.static(__dirname + '/public'));

app.get('/judge', async(req, res) => {
  try {
    let { problems, startTime, participant1, participant2 } = _.get(req, 'query', {});

    if (!problems || !startTime || !participant1 || !participant2) {
      return res.failed(null, 'Missing required param');
    }

    problems = problems.split(',');

    let judged = await Promise.all(problems.map(problemInfo => {
      let [contestId, problem] = problemInfo.split(':');

      return core.judge(contestId, problem, startTime, participant1, participant2);
    }));

    console.log(judged);

    return res.success(judged);
  } catch (err) {
    console.log(err);

    return res.failed(err);
  }
});

app.get('/create', async(req, res) => {
  try {
    let { participant1, participant2 } = _.get(req, 'query', {});

    if (!participant1 || !participant2) {
      return res.failed(null, 'Missing required param');
    }

    let problems = core.problemPick(9)

    // problems = problems.map(problem => `${problem.url.split('/').reverse()[2]}:${problem.problem}`).join(',');

    let startTime = Date.now();

    return res.success({
      problems,
      startTime,
      participant1,
      participant2
    });
  } catch (err) {
    console.log(err);

    return res.failed(err);
  }
});

app.get('/problemsInfo', async(req, res) => {
  try {
    let { problems } = _.get(req, 'query', {});

    return res.success(core.getProblemsInfo(problems));
  } catch (err) {
    console.log(err);

    return res.failed(err);
  }
});

app.listen(3000, () => {
  console.log('Server running');
});