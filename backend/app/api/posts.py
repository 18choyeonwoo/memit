from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from ..database import get_session
from ..models.post import Post, PostComment
from ..models.user import User
from ..schemas.post import PostCreate, CommentCreate, PostResponse, CommentResponse
from ..core.deps import get_current_user

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostResponse)
def create_post(
    post_in: PostCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = Post(
        title=post_in.title,
        content=post_in.content,
        is_anonymous=post_in.is_anonymous,
        user_id=current_user.id,
    )
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/", response_model=List[PostResponse])
def list_posts(session: Session = Depends(get_session)):
    posts = session.exec(select(Post).order_by(Post.created_at.desc())).all()
    return posts


@router.delete("/{post_id}", status_code=204)
def delete_post(
    post_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    if post.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your post")

    for comment in session.exec(select(PostComment).where(PostComment.post_id == post_id)).all():
        session.delete(comment)
    session.flush()
    session.delete(post)
    session.commit()


@router.post("/{post_id}/comments", response_model=CommentResponse)
def create_comment(
    post_id: int,
    comment_in: CommentCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    if not session.get(Post, post_id):
        raise HTTPException(status_code=404, detail="Post not found")
    comment = PostComment(
        content=comment_in.content,
        is_anonymous=comment_in.is_anonymous,
        user_id=current_user.id,
        post_id=post_id,
    )
    session.add(comment)
    session.commit()
    session.refresh(comment)
    return comment


@router.delete("/{post_id}/comments/{comment_id}", status_code=204)
def delete_comment(
    post_id: int,
    comment_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    comment = session.get(PostComment, comment_id)
    if not comment or comment.post_id != post_id:
        raise HTTPException(status_code=404, detail="Comment not found")
    if comment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your comment")
    session.delete(comment)
    session.commit()
