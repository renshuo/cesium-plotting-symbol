

export default class GraphManager{
  static instance

  static getInstance () {
    if (!this.instance) {
      this.instance = new GraphManager()
    }
    return this.instance
  }

  constructor () {
  }

  graphList = []
  add (g) {
    this.graphList.push(g)
  }

  getAll () {
    return this.graphList
  }

  clean () {
    this.graphList = []
  }
}