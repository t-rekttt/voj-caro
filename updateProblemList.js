let cf = require('codeforces-api');
let fs = require('fs');

let group = 'FLVn1Sc504';

let getOIContests = async() => {
  let contests = await cf.getGroupContestsList();

  return contests.filter(contest => contest.name.includes('OI set'));
}

let getOIProblems = async() => {
  let oiContests = await getOIContests();

  let problemSets = await Promise.all(oiContests.map(contest => cf.getProblemsListInGroupContest(group, contest.contestId)));

  return problemSets.reduce((curr, problemSet) => curr.concat(problemSet), []);
}

(async() => {
  let oiProblems = await getOIProblems();

  fs.writeFileSync('./problems.json', JSON.stringify(oiProblems));
})();