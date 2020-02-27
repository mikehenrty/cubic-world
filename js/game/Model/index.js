import BoardModel from './BoardModel';
import CubeModel from './CubeModel';


export default class Model {
  constructor() {
    this.cube = new CubeModel();
    this.board = new BoardModel();
  }

  updateCube(direction) {
    return this.cube.update(direction);
  }

  getCubeXYPosition() {
    return this.cube.getXYPosition();
  }

  getCubeXZPosition() {
    return this.cube.getXZPosition();
  }

  getCubeStaticQaternion() {
    return this.cube.getStaticQuaternion();
  }

  getBoardSquareColor(x, y) {
    return this.board.getColor(x, y);
  }
}
