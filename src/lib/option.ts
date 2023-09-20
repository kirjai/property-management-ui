import { Option, pipe } from "effect";
import * as O from "fp-ts/lib/Option";

export const fromFPTSOption = <T>(fptsOption: O.Option<T>) =>
  pipe(
    fptsOption,
    O.fold(() => Option.none(), Option.some)
  );
