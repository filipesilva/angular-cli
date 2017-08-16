import * as ts from 'typescript';

export enum ProgramManagerType {
  TypeScriptCompiler,
  AngularCompiler
}

export interface ProgramManagerInterface {
  program: ts.Program;
  type: ProgramManagerType;
  update(newFiles: string[]): void;
  hasFile(fileName: string): boolean;
  emit(sourceFile: ts.SourceFile): ts.TranspileOutput;
}
