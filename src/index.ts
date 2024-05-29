import { STORAGE_KEY, readLocalStorage, saveLocalStorage } from "./storage";
import { Memo } from "./types";
import { Marked, marked } from "marked";
// 要素一覧

const memoList = document.getElementById("list") as HTMLDivElement;
const addButton = document.getElementById("add") as HTMLButtonElement;
const memoTitle = document.getElementById("memoTitle") as HTMLInputElement;
const memoBody = document.getElementById("memoBody") as HTMLTextAreaElement;
const editButton = document.getElementById("edit") as HTMLButtonElement;
const saveButton = document.getElementById("save") as HTMLButtonElement;
const deleteBUtton = document.getElementById("delete") as HTMLButtonElement;
const previewBody = document.getElementById("previewBody") as HTMLDivElement;
const downloadLink = document.getElementById("download") as HTMLAnchorElement;
// 処理


let memos: Memo[] = [];
let memoIndex: number = 0;
downloadLink.addEventListener("click",clickDownloadMemo);
deleteBUtton.addEventListener("click",clickDeleteMemo);
addButton.addEventListener("click",clickAddMemo);
editButton.addEventListener("click",clickEditMemo);
saveButton.addEventListener("click",clickSaveMemo);

init();

// 関数一覧

function newMemo(): Memo {
    const timestamp : number = Date.now();
    return {
        id:timestamp.toString() + memos.length.toString(),
        title: `new memo ${memos.length + 1}`,
        body: "",
        createdAt: timestamp,
        updatedAt: timestamp,
    }
}

function init(){
    memos = readLocalStorage(STORAGE_KEY);
    console.log(memos);
    if(memos.length === 0){
        // 新しいメモを二つ作成する
        memos.push(newMemo());
        memos.push(newMemo());
        // すべてのメモをローカルストレージに保存する
        saveLocalStorage(STORAGE_KEY,memos);
    }
        console.log(memos);
        // すべてのメモのタイトルをメモ一覧に表示する
        showMemoElements(memoList,memos);
        // メモ一覧のタイトルにアクティブなスタイルを設定する
        setActiveStyle(memoIndex +1, true);
        // 選択中のメモ情報を表示用のメモ要素に設定する
        setMemoElement();
        // 保存ボタンを非表示にし編集ボタンを表示する
        setHiddenButton(saveButton,false);
        setHiddenButton(editButton,true);
}

// メモの要素を作成する
function newMemoElement(memo: Memo):HTMLDivElement{
    // div要素を追加する
    const div =document.createElement("div");
    // div要素にタイトルを追加する
    div.innerText = memo.title;
    // div要素のdata-id属性にメモIDを設定する
    div.setAttribute("data-id",memo.id);
    // div要素のclass属性にスタイルを設定する
    div.classList.add('w-full','p-sm');
    div.addEventListener("click", selectedMemo);
    return div;
}

// すべてのメモ要素を削除する
function clearMemoElements(div: HTMLDivElement){
    div.innerText = "";
}
// すべてのメモを表示する
function showMemoElements(div:HTMLDivElement, memos:Memo[]){
    // メモ一覧をクリアする
    clearMemoElements(div);
    memos.forEach((memo)=>{
        // メモのタイトル要素を作成する
        const memoElement = newMemoElement(memo);
        // メモ一覧の末尾にメモのタイトルの要素を追加する
        div.appendChild(memoElement);
    })
}

function setActiveStyle(index:number,isActive:boolean){
    const selector = `#list > div:nth-child(${index})`;
    const element = document.querySelector(selector) as HTMLDivElement;
    if(isActive) {
        element.classList.add(`active`);
    }else{
        element.classList.remove(`active`);
    }
}

    // メモを設定する
    function setMemoElement(){
        const memo: Memo = memos[memoIndex];
        // メモを表示する要素にタイトルと本文を設定する
        memoTitle.value = memo.title;
        memoBody.value = memo.body;
        // markdownで記述した本文（文字列）をHTMLにパースする
        (async ()=>{
            try{
                previewBody.innerHTML = await marked.parse(memo.body);
            }catch(error){
                console.error(error);
            }
        })();   
}

    // button要素の表示・非表示を設定する
    function setHiddenButton(button: HTMLButtonElement, isHidden:boolean){
        if(isHidden){
            button.removeAttribute('hidden');
        }else{
            button.setAttribute("hidden","hidden");
        }
    }

    function setEditMode(EditMode:boolean){
        if(EditMode){
            memoTitle.removeAttribute("disabled");
            memoBody.removeAttribute("disabled");
            // 編集モード時はtextareaを表示し、プレビュー用を非表示にする
            memoBody.removeAttribute('hidden');
            previewBody.setAttribute("hidden","hidden");
        }else{
            memoTitle.setAttribute("disabled","disabled");
            memoBody.setAttribute("disabled","disabled");
             // 編集モード時はtextareaを表示し、プレビュー用を表示にする
            memoBody.setAttribute("hidden","hidden");
            previewBody.removeAttribute('hidden');
}
    }

// イベント関連の関数一覧

function clickAddMemo(event: MouseEvent){
    // タイトルと本文を編集モードにする
    setEditMode(true);
    // 保存ボタンを表示し、編集ボタンを非表示にする
    setHiddenButton(saveButton,true);
    setHiddenButton(editButton,false);
    // 新しいメモを追加する
    memos.push(newMemo());
    // すべてのメモをローカルストレージに保存する
    saveLocalStorage(STORAGE_KEY,memos);
    // 新しいメモが追加されたインデックスを設定する
    memoIndex = memos.length -1;
    // すべてのメモのタイトルをメモ一覧に表示する
    showMemoElements(memoList,memos);
    // メモ一覧のタイトルにアクティブなスタイルを設定する
    setActiveStyle(memoIndex + 1, true);
    // 選択中のメモ情報を表示用のメモ要素に設定する
    setMemoElement();
}

    // メモが選択されたときの処理
    function selectedMemo(event:MouseEvent){
        // タイトルと本文を表示モードにする
        setEditMode(false);
        // 保存ボタンを非表示にし編集ボタンを表示する
        setHiddenButton(saveButton,false);
        setHiddenButton(editButton,true);
        // メモ一覧のタイトルにアクティブなスタイルを設定する
        setActiveStyle(memoIndex + 1, false);
        // クリックされたdiv要素のdata-id属性からメモIDを取得する
        const target = event.target as HTMLDivElement;
        const id = target.getAttribute('data-id');
        // 選択されたメモのインデックスを取得する
        memoIndex = memos.findIndex((memo) => memo.id === id);
        // 選択中のメモ情報を表示用のメモ要素に設定する
        setMemoElement();
        // メモ一覧のタイトルアクティブな要素を追加する
        setActiveStyle(memoIndex + 1, true);
    }

    function clickEditMemo(event:MouseEvent){
        // タイトルと本文を編集モードにする
        setEditMode(true);
        // 保存ボタンを表示し編集ボタンを非表示にする
        setHiddenButton(saveButton,true);
        setHiddenButton(editButton,false);
    }

    function clickSaveMemo(event:MouseEvent){
        // メモデータを更新する
        const memo: Memo = memos[memoIndex];
        memo.title = memoTitle.value;
        memo.body = memoBody.value;
        memo.updatedAt = Date.now();
        saveLocalStorage(STORAGE_KEY,memos);
        setEditMode(false);
        setHiddenButton(saveButton,false);
        setHiddenButton(editButton,true);
        showMemoElements(memoList,memos);
        setActiveStyle(memoIndex + 1, true);
        setMemoElement();
    }

    function clickDeleteMemo(event: MouseEvent){
        if(memos.length === 1){
            alert("これ以上は削除できません");
            return;
        }
        // 表示中のメモのIDを取得する
        const memoId = memos[memoIndex].id;
        // すべてのメモから表示中のメモを削除する
        memos = memos.filter((memo) => memo.id !== memoId);
        // すべてのメモをローカルストレージに保存する
        saveLocalStorage(STORAGE_KEY,memos);
        // 表示するメモのインデックスを1つ前のものにする
        if(1<=memoIndex){
            memoIndex--;
        }
        // 表示するメモを設定する
        setMemoElement();
        // 画面右側を表示モードにする
        setEditMode(false);
        // 保存ボタンを非表示にし編集ボタンを表示する
        setHiddenButton(saveButton, false);
        setHiddenButton(editButton, true);
        // 画面右側のメモのタイトル一覧をクリアして再構築する
        showMemoElements(memoList, memos);
        // 表示するメモのタイトルにアクティブなスタイルを設定する
        setActiveStyle(memoIndex+1, true);
    }

    // ダウンロードのリンクがクリックされた時の処理
    function clickDownloadMemo(event: MouseEvent){
        // ダウンロードするファイルの名前を指定する
        const memo = memos[memoIndex];
        // イベントが発生した要素を取得する
        const target = event.target as HTMLAnchorElement;
        // ダウンロードするファイルの名前を指定する
        target.download = `${memo.title}.md`;
        // ダウンロードするファイルのデータを設定する
        target.href = URL.createObjectURL(
            new Blob([memo.body],{
                type: "application/octet-stream",
            })
        )
    }