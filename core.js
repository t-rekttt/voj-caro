let cf = require('codeforces-api');
let _ = require('lodash');
let fs = require('fs');

let group = 'FLVn1Sc504';

let ACVerdicts = ['Happy New Year!', 'Accepted', 'Perfect'];

let partialVerdicts = ['Partial'];

let problems = JSON.parse(fs.readFileSync('./problems.json', 'utf-8'));

let problemsObj = problems.reduce((curr, problem) => {
  curr[[problem.url.split('/').reverse()[2], problem.problem]] = problem;

  return curr;
}, {});

let problemPick = (n = 9) => {
  return _.sampleSize(problems, n);
}

let judge = async(contestId, problem, startTime, participant1, participant2) => {
  let [submissionsParticipant1, submissionsParticipant2] = await Promise.all([
    cf.getSubmissionsInGroupContest(group, contestId, problem, participant1),
    cf.getSubmissionsInGroupContest(group, contestId, problem, participant2)
  ]);

  let submissions = submissionsParticipant1.concat(submissionsParticipant2);

  submissions = submissions.filter(submission => {
    let neededVerdicts = ACVerdicts.concat(partialVerdicts);

    for (let verdict of neededVerdicts)
      if (submission.verdict.includes(verdict))
        return true;
    
    return false;
  }).map(submission => {
    for (let verdict of ACVerdicts) {
      if (submission.verdict.includes(verdict)) {
        submission.AC = true;
        break
      }
    }

    if (submission.verdict.includes('Perfect') || submission.verdict.includes('Partial')) {
      submission.score = parseFloat(/([0-9]+)/.exec(submission.verdict));
    }

    return submission;
  });

  submissions = submissions.filter(submission => submission.submissionTime >= startTime);

  submissions.sort((a, b) => a.submissionTime - b.submissionTime);

  if (!submissions.length) return {};

  let best = submissions[0];

  for (let submission of submissions) {
    if (best.AC) break;

    if (submission.score > best.score) {
      best = submission;
    }
  }

  return best;
}

let getProblemsInfo = problemStr => {
  if (!problemStr) return [];

  let problems = problemStr.split(',');

  return problems.map(problemInfo => {
    return problemsObj[problemInfo.split(':')];
  });
}

module.exports = { problemPick, judge, getProblemsInfo }