import {
  Badge,
  Button,
  clsx,
  LoadingOverlay,
  Textarea,
  Title,
  Tooltip,
} from "@mantine/core";
import { useHotkeys } from "@mantine/hooks";
import { useMount, useRequest, useSetState } from "ahooks";
import { useRef } from "react";
import { tw } from "twind";
import { apiTypingTips } from "./api";

export interface WordTipOrigin {
  next: number;
  word: string;
  wordCode: string;
  words: string | null;
  wordsCode: string | null;
  type: string | null;
}

const typingContentStore = {
  write(content: string) {
    localStorage.setItem("typingContent", content);
  },
  read() {
    return (localStorage.getItem("typingContent") ||
      "忽如一夜春风来") as string;
  },
};

function App(): JSX.Element {
  const {
    loading: typingTipLoading,
    data: typingTipSource,
    run: requestTypingTip,
  } = useRequest(apiTypingTips, {
    manual: true,
  });
  const [{ currentInputContent }, setStates] = useSetState({
    currentInputContent: "",
  });
  const typingInputElement = useRef<HTMLTextAreaElement>(null);

  useHotkeys([
    [
      "ctrl+e",
      () => {
        loadTypingContent();
      },
    ],
  ]);

  useMount(function registerInputListener() {
    let lock = false;
    typingInputElement.current!.addEventListener(
      "compositionstart",
      function () {
        lock = true;
      }
    );
    typingInputElement.current!.addEventListener("compositionend", (event) => {
      lock = false;
      inputContentChange((event as any).target.value);
    });
    typingInputElement.current!.addEventListener("input", (event) => {
      if (!lock) inputContentChange((event as any).target.value);
    });

    typingInputElement.current!.addEventListener("keydown", (event) => {
      if (event.key === "F3") {
        clearInputContent();
        event.preventDefault();
      }
    });

    return;

    function inputContentChange(content: string) {
      setStates({ currentInputContent: content });
    }
  });

  useMount(function loadDefaultTypingContent() {
    loadTypingContent(typingContentStore.read());
  });

  function clearInputContent() {
    typingInputElement.current!.value = "";
    setStates({ currentInputContent: "" });
  }

  async function loadTypingContent(defaultContent?: string) {
    clearInputContent();

    if (defaultContent) {
      requestTypingTip(defaultContent);
    } else {
      const typingContent = await navigator.clipboard.readText();
      typingContentStore.write(typingContent);
      requestTypingTip(typingContent);
    }
  }

  return (
    <div className={tw`h-screen w-screen flex flex-col`}>
      <LoadingOverlay visible={typingTipLoading} overlayBlur={2} />

      <div
        className={tw`h-[50px] w-full flex items-center justify-between px-[20px]`}
      >
        <Title order={2}>typing-tips</Title>
        <div>
          {renderCurrentTypingWordCode()}
          <Tooltip
            label={<span>Ctrl + e</span>}
            color="gray"
            position="bottom"
            withArrow
          >
            <Button
              variant="filled"
              color="violet"
              radius="md"
              onClick={() => {
                loadTypingContent();
              }}
            >
              从剪贴板载文
            </Button>
          </Tooltip>
        </div>
      </div>
      <div className={tw`w-full flex(1 & col) px-[20px] pb-[10px]`}>
        <div
          className={tw`w-full flex(1 & wrap) content-start mb-[10px] border-1 p-[5px] text-[20px]`}
        >
          {renderTypingContent()}
        </div>
        <Textarea
          disabled={typingTipSource === undefined}
          ref={typingInputElement}
          placeholder="..."
          autosize
          minRows={2}
          maxRows={4}
        />
      </div>
    </div>
  );

  function renderCurrentTypingWordCode(): React.ReactNode {
    if (
      typingTipSource === undefined ||
      currentInputContent.length === typingTipSource.result.length
    )
      return null;

    const currentWordSource =
      typingTipSource.result[currentInputContent.length];

    return (
      <Badge color="grape" className={tw`normal-case mr-[10px]`}>
        {currentWordSource.wordsCode || currentWordSource.wordCode}
      </Badge>
    );
  }

  function renderTypingContent(): React.ReactNode {
    if (!typingTipSource) return null;

    const { result: wordTipSource } = typingTipSource;
    const currentInputIndex = currentInputContent.length;

    const styles = {
      // 词的样式
      word: tw`text-[#7af500] border(b-[2px] solid)`,
      wordHead: tw`ml-[4px]`,
      /** 已打过的字 */
      historyChar: tw`bg-[#2b2b2a] `,
      singeChar: tw`text-[block]`,
    };

    let prevUsefulNextVal: number = -1;

    return wordTipSource.map((render, renderIndex) => {
      let isWordHead = false;

      const classNames: string[] = (() => {
        const names: string[] = [tw`mb-[15px] relative`];

        if (renderIndex < currentInputIndex) {
          names.push(styles.historyChar);
        } else {
          if (
            render.next > prevUsefulNextVal &&
            render.next !== renderIndex &&
            renderIndex !== prevUsefulNextVal
          ) {
            prevUsefulNextVal = render.next;
            names.push(styles.word, styles.wordHead);
            isWordHead = true;
          } else if (render.next === renderIndex) {
            if (render.next <= prevUsefulNextVal) {
              names.push(styles.word);
            } else {
              names.push(styles.singeChar);
            }
          } else if (renderIndex <= prevUsefulNextVal) {
            names.push(styles.word);
          }
        }

        return names;
      })();

      return (
        <Tooltip
          label={renderLabel()}
          color="teal"
          position="bottom-start"
          withArrow
          key={renderIndex}
        >
          <div className={clsx(...classNames)}>
            {render.word}
            {isWordHead && (
              <span
                className={tw`absolute left-[2px] bottom-[-20px] text([12px] [red])`}
              >
                {render.wordsCode}
              </span>
            )}
          </div>
        </Tooltip>
      );

      function renderLabel(): React.ReactNode {
        return (
          <div className={tw`flex(& col)`}>
            {Object.entries(render).map(([key, value]) => (
              <div>
                {key} -
                {value !== null ? (
                  <Badge color="lime" className={tw`normal-case ml-[5px]`}>
                    {value}
                  </Badge>
                ) : (
                  <span className={tw`ml-[5px]`}>null</span>
                )}
              </div>
            ))}
          </div>
        );
      }
    });
  }
}

export default App;
