import React from "react";
// const winkNLP = require("wink-nlp");
// const model = require("wink-eng-lite-web-model");
import * as ts from "@tensorflow/tfjs";
import * as qna from "@tensorflow-models/qna";

interface IProps {}
const NLP: React.FC<IProps> = () => {
  //   // @ts-ignore

  //   const nlp = winkNLP(model);
  //   var text = "hello world";
  //   var doc = nlp.readDoc(text);

  //   console.log(doc.tokens().out());

  React.useEffect(()=>{
    qna.load().then((model) => {
        console.log("load done");
        // model.findAnswers("今天天气怎么样", "天气晴天！").then((answers) => {
        //   console.log("Answers: ", answers);
          
        // });
      });
  }, [])

  return <div>NLP</div>;
};

export default NLP;
