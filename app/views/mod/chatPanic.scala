package views.html.mod

import controllers.routes

import lila.app.templating.Environment.*
import lila.ui.ScalatagsTemplate.{ *, given }

object chatPanic:

  def apply(state: Option[Instant])(using PageContext) =
    val title = "Chat Panic"
    views.html.base.layout(
      title = title,
      moreCss = cssTag("mod.misc")
    ) {
      main(cls := "page-menu")(
        views.html.mod.menu("panic"),
        div(id := "chat-panic", cls := "page-menu__content box box-pad")(
          h1(cls := "box__top")(title),
          p(
            "When Chat Panic is enabled, restrictions apply to public chats (tournament, simul) and PM",
            br,
            "Only players 24h old, and with 10 games played, can write messages."
          ),
          p(
            "Current state: ",
            state
              .map { s =>
                frag(
                  goodTag(cls := "text", dataIcon := Icon.Checkmark)(strong("ENABLED")),
                  ". Expires ",
                  momentFromNow(s)
                )
              }
              .getOrElse(badTag(cls := "text", dataIcon := Icon.X)(strong("DISABLED")))
          ),
          div(cls := "forms")(
            if state.isDefined then
              frag(
                postForm(action := s"${routes.Mod.chatPanicPost}?v=0")(
                  submitButton(cls := "button button-fat button-red text", dataIcon := Icon.X)("Disable")
                ),
                postForm(action := s"${routes.Mod.chatPanicPost}?v=1")(
                  submitButton(cls := "button button-fat button-green text", dataIcon := Icon.Checkmark)(
                    "Renew for two hours"
                  )
                )
              )
            else
              postForm(action := s"${routes.Mod.chatPanicPost}?v=1")(
                submitButton(cls := "button button-fat text", dataIcon := Icon.Checkmark)("Enable")
              )
          )
        )
      )
    }
