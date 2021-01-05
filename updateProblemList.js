let cf = require('codeforces-api');
let fs = require('fs');

let group = 'FLVn1Sc504';

let getOIContests = async(group) => {
  let contests = await cf.getGroupContestsList(group);

  return contests.filter(contest => contest.name.includes('OI set'));
}

let getOIProblems = async(group) => {
  let oiContests = await getOIContests(group);

  let problemSets = await Promise.all(oiContests.map(contest => cf.getProblemsListInGroupContest(group, contest.contestId)));

  return problemSets.reduce((curr, problemSet) => curr.concat(problemSet), []);
}

(async() => {
  let oiProblems = await getOIProblems(group);

  fs.writeFileSync('./problems.json', JSON.stringify(oiProblems));
})();