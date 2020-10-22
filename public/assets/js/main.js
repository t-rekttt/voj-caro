new Vue({
  el: '#main',
  data: {
    problems: [],
    status: [],
    problemStr: '',
    updateStatus: 'Idle',
    nextUpdate: 1
  },
  // computed: {
  //   problemStr() { 
  //     return this.problems ? this.problems.map(problem => `${problem.url.split('/').reverse()[2]}:${problem.problem}`).join(',') : '';
  //   }
  // },
  methods: {
    judge(problemStr, startTime, participant1, participant2) {
      return axios('/judge', { 
        params: {
          problems: problemStr,
          startTime,
          participant1,
          participant2
        }
      });
    },
    getProblemsInfo(problemStr) {
      return axios('/problemsInfo', {
        params: {
          problems: problemStr
        }
      });
    },
    async update() {
      this.updateStatus = 'Updating...';

      let problemsInfo = await this.getProblemsInfo(this.problemStr);
      
      this.problems = problemsInfo.data.data;

      let judgeResult = await this.judge(this.problemStr, this.startTime, this.participant1, this.participant2);

      this.status = judgeResult.data.data;

      this.updateStatus = 'Idle';
    },
    async scheduleUpdate() {
      while (this.nextUpdate > 0) {
        this.nextUpdate--;
        await new Promise(cb => setTimeout(() => cb(), 1000));
      }

      await this.update();

      this.nextUpdate = 10;

      this.scheduleUpdate();
    }
  },
  mounted() {
    let querystring = new URLSearchParams(window.location.search);
    
    this.problemStr = querystring.get('problems');
    this.participant1 = querystring.get('participant1');
    this.participant2 = querystring.get('participant2');
    this.startTime = querystring.get('startTime') || Date.now() - 60 * 60 * 1000; 

    this.scheduleUpdate();
  }
})