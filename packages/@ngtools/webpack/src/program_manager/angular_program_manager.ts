import * as ts from 'typescript';
import {
  Program,
  createProgram,
  createCompilerHost,
  EmitFlags,
} from '@angular/compiler-cli';
import { CompilerHost } from '@angular/compiler-cli/src/transformers/api';
import { ProgramManagerInterface, ProgramManagerType } from './interfaces';

export class AngularProgramManager implements ProgramManagerInterface {
  private _program: Program;
  private _compilerHost: CompilerHost;
  public type: ProgramManagerType = ProgramManagerType.AngularCompiler;

  get program() { return this._program.getTsProgram(); }

  // Create and manage a Angular Program instance.
  constructor(
    private _files: string[],
    private _compilerOptions: ts.CompilerOptions,
    tsCompilerHost: ts.CompilerHost,
  ) {
    this._compilerHost = createCompilerHost({
      options: this._compilerOptions,
      tsHost: tsCompilerHost
    });
  }

  // Create the program asynchronously.
  initialize() {
    console.log('# in initialize')
    this._program = createProgram({
      rootNames: this._files,
      options: this._compilerOptions,
      host: this._compilerHost
    });
    console.log('# after program creation')

    return this._program.loadNgStructureAsync()
      .then(() => {
        console.log('getNgOptionDiagnostics', this._program.getNgOptionDiagnostics())
        console.log('getTsOptionDiagnostics', this._program.getTsOptionDiagnostics())

        console.log('getTsSyntacticDiagnostics', this._program.getTsSyntacticDiagnostics())

        console.log('getNgStructuralDiagnostics', this._program.getNgStructuralDiagnostics())
        console.log('getTsSemanticDiagnostics', this._program.getTsSemanticDiagnostics())

        console.log('getNgSemanticDiagnostics', this._program.getNgSemanticDiagnostics())
      });
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

    this._program = createProgram({
      rootNames: this._files,
      options: this._compilerOptions,
      host: this._compilerHost,
      oldProgram: this._program
    });
  }

  hasFile(fileName: string) {
    return this._files.includes(fileName);
  }


  emit(sourceFile: ts.SourceFile) {
    let result: ts.TranspileOutput = {
      outputText: undefined,
      sourceMapText: undefined
    };

    // console.log('###', sourceFile.fileName)
    // TODO figure out what to do with the diagnostics in performCompilation;

    const { emitSkipped } = this._program.emit({ emitFlags: EmitFlags.Default });

    if (emitSkipped) {
      throw new Error(`Emit failed.`);
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
