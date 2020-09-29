---
title: "git的使用总结"
date: "2020-09-29"
---

1，在本地基于当前分支建立新的分支

```
git checkout -b <newbranchname>

git checkout <branchname>
//切换已有分支
```

2，拉代码

```
git pull
```

3，代码准备合并到newbranch处理冲突 rebase

```
git rebase <newbranch>

git add .
//将当前处理冲突文件加到缓冲区

git rebase --continue
//继续处理冲突

// 取消reabse 好像是git reabse --abort

git push -f
// 处理冲突结束，将本地reabse的变更提交到远程仓库
```

4，在本地强制删除分支

```
git branch -D <branchname>
```

5，提交，推送

```
git commit

git push
// 可借助 vscode git 工具
```

6，将当前分支代码合并到新分支

```
git merge <newbranchname>
```

7，合并提交，解决提交冲突







