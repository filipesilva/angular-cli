import * as ts from 'typescript';
import { ProgramManagerInterface, ProgramManagerType } from './interfaces';

export class TypescriptProgramManager implements ProgramManagerInterface {
  private _program: ts.Program;
  public type: ProgramManagerType = ProgramManagerType.TypeScriptCompiler;

  get program() { return this._program; }

  // Create and manage a Typescript Program instance.
  constructor(
    private _files: string[],
    private _compilerOptions: ts.CompilerOptions,
    private _compilerHost: ts.CompilerHost,
  ) { }

  // Create the program asynchronously.
  initialize() {
    this._program = ts.createProgram(this._files, this._compilerOptions, this._compilerHost);

    return Promise.resolve();
  }

  /**
   * Create a new Program, based on the old one. This will trigger a resolution of all
   * transitive modules, which include files that might just have been generated.
   * This needs to happen after the code generator has been created for generated files
   * to be properly resolved.
   */
  update(newFiles: string[] = []) {
    // Remove files that don't exist anymore, and add new files.
    this._files = this._files.concat(newFiles)
      .filter(x => this._compilerHost.fileExists(x));

    this._program = ts.createProgram(this._files, this._compilerOptions, this._compilerHost,
      this._program);
  }

  hasFile(fileName: string) {
    return this._files.includes(fileName);
  }


  emit(sourceFile: ts.SourceFile) {
    let result: ts.TranspileOutput = {
      outputText: undefined,
      sourceMapText: undefined
    };

    const { emitSkipped } = this.program.emit(sourceFile);

    if (emitSkipped) {
      throw new Error(`${sourceFile.fileName} emit failed.`);
    }

    const outputFile = sourceFile.fileName.replace(/.ts$/, '.js');
    result.outputText = this._compilerHost.readFile(outputFile);
    result.sourceMapText = this._compilerHost.readFile(outputFile + '.map');

    if (result.outputText === undefined) {
      // Something went wrong in reading the emitted file;
      throw new Error(`Could not retrieve emitted TypeScript for ${sourceFile.fileName}.`);
    }

    return result;
  }
}
