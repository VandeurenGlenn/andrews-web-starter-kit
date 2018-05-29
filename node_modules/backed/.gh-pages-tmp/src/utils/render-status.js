let sheduled = false;
const afterRenderQue = [];
const beforeRenderQue = [];

const callMethod = array => {
  const context = array[0];
  const callback = array[1];
  const args = array[2];
  try {
    callback.apply(context, args);
  } catch(e) {
    setTimeout(() => {
      throw e;
    })
  }
};

const flushQue = que => {
  while (que.length) {
    callMethod(que.shift);
  }
};

const runQue = que => {
  for (let i=0, l=que.length; i < l; i++) {
    callMethod(que.shift());
  }
  sheduled = false;
}

const shedule = () => {
  sheduled = true;
  requestAnimationFrame(() => {
    flushQue(beforeRenderQue);
    setTimeout(() => {
      runQue(afterRenderQue);
    });
  });
};

export default (() => {
  window.RenderStatus = window.RenderStatus || {
    afterRender: (context, callback, args) => {
      if (!sheduled) {
        shedule();
      }
      afterRenderQue.push([context, callback, args]);
    },
    beforeRender: (context, callback, args) => {
      if (!sheduled) {
        shedule();
      }
      beforeRenderQue.push([context, callback, args]);
    }
  }
})();
