"""Fabrica de routers CRUD.

Experiencia, educacion y skills comparten exactamente la misma forma: listado
publico ordenado y alta/edicion/baja para el admin. En vez de copiar el mismo
router tres veces, se genera desde aca.
"""

from collections.abc import Callable
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import Base, get_db
from app.core.security import get_current_admin


def build_crud_router(
    *,
    prefix: str,
    tag: str,
    model: type[Base],
    create_schema: type[BaseModel],
    out_schema: type[BaseModel],
    order_by: Callable[[], list[Any]],
    not_found: str,
) -> APIRouter:
    router = APIRouter(prefix=prefix, tags=[tag])

    def _get_or_404(db: Session, item_id: int) -> Any:
        item = db.get(model, item_id)
        if not item:
            raise HTTPException(status_code=404, detail=not_found)
        return item

    @router.get("", response_model=list[out_schema])
    def list_items(db: Session = Depends(get_db)) -> Any:
        return db.query(model).order_by(*order_by()).all()

    @router.post(
        "",
        response_model=out_schema,
        status_code=status.HTTP_201_CREATED,
        dependencies=[Depends(get_current_admin)],
    )
    def create_item(payload: create_schema, db: Session = Depends(get_db)) -> Any:
        item = model(**payload.model_dump())
        db.add(item)
        db.commit()
        db.refresh(item)
        return item

    @router.put("/{item_id}", response_model=out_schema, dependencies=[Depends(get_current_admin)])
    def update_item(item_id: int, payload: create_schema, db: Session = Depends(get_db)) -> Any:
        item = _get_or_404(db, item_id)
        for field, value in payload.model_dump().items():
            setattr(item, field, value)
        db.commit()
        db.refresh(item)
        return item

    @router.delete(
        "/{item_id}",
        status_code=status.HTTP_204_NO_CONTENT,
        dependencies=[Depends(get_current_admin)],
    )
    def delete_item(item_id: int, db: Session = Depends(get_db)) -> Response:
        db.delete(_get_or_404(db, item_id))
        db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return router
