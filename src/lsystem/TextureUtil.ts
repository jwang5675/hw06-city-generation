export default class TextureUtil {
	textureData: Uint8Array;

	constructor(textureData: Uint8Array) {
		this.textureData = textureData;
	}

	// Returns value between 0 and 1 for the given x, y texture coordinate for water elevation
	getWater(x: number, y: number) {
		let xpos = Math.floor(x);
    let ypos = Math.floor(y);
    let offset = 0;
    let index = ypos * 2000 * 4 + xpos * 4 + offset;
    return this.textureData[index] / 255;
	}

	// Returns value between 0 and 1 for the given x, y texture coordinate for terrain elevation
	getElevation(x: number, y: number) {
		let xpos = Math.floor(x);
    let ypos = Math.floor(y);
    let offset = 1;
    let index = ypos * 2000 * 4 + xpos * 4 + offset;
    return this.textureData[index] / 255;
	}

	// Returns value between 0 and 1 for the given x, y texture coordinate for population elevation
	getPopulation(x: number, y: number) {
		let xpos = Math.floor(x);
    let ypos = Math.floor(y);
    let offset = 2;
    let index = ypos * 2000 * 4 + xpos * 4 + offset;
    return this.textureData[index] / 255;
	}

}